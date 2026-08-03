import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import ActivityService from './activity.service.js';

// Custom error class to represent API exceptions
class APIError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class AuthService {
  // Utility helper writing activity events into database logs
  static async logActivity({ userId, action, status, ipAddress, userAgent }) {
    try {
      await prisma.authLog.create({
        data: {
          userId,
          action,
          status,
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'unknown'
        }
      });
    } catch (error) {
      console.error('Failed logging authentication activity:', error);
    }
  }

  // Helper signing Access Token (JWT)
  static generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  // Helper signing Refresh Token (JWT)
  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  // Register New User accounts
  static async registerUser(data, ipAddress, userAgent) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      await this.logActivity({
        userId: null,
        action: 'REGISTRATION',
        status: 'FAILED',
        ipAddress,
        userAgent
      });
      throw new APIError('Email address already registered.', 400);
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    await this.logActivity({
      userId: user.id,
      action: 'REGISTRATION',
      status: 'SUCCESS',
      ipAddress,
      userAgent
    });

    return user;
  }

  // Authenticate user credentials and open sessions
  static async loginUser(email, password, ipAddress, userAgent) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      await this.logActivity({
        userId: null,
        action: 'LOGIN',
        status: 'FAILED',
        ipAddress,
        userAgent
      });
      await ActivityService.logActivity({
        userId: null,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: 'anonymous',
        description: `Failed login attempt for email: ${email}`
      });
      throw new APIError('Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await this.logActivity({
        userId: user.id,
        action: 'LOGIN',
        status: 'FAILED',
        ipAddress,
        userAgent
      });
      await ActivityService.logActivity({
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        description: `Failed login attempt (incorrect password) for email: ${email}`
      });
      throw new APIError('Invalid email or password.', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    await prisma.session.create({
      data: {
        refreshToken,
        userId: user.id,
        userAgent: userAgent || 'unknown',
        ipAddress: ipAddress || '127.0.0.1',
        expiresAt
      }
    });

    await this.logActivity({
      userId: user.id,
      action: 'LOGIN',
      status: 'SUCCESS',
      ipAddress,
      userAgent
    });

    await ActivityService.logActivity({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      description: `User ${user.email} logged in successfully`
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  // Rotate Session and Refresh Tokens
  static async rotateSession(oldRefreshToken, ipAddress, userAgent) {
    try {
      const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
      
      const session = await prisma.session.findUnique({
        where: { refreshToken: oldRefreshToken },
        include: { user: true }
      });

      if (!session) {
        throw new APIError('Session not found or invalid.', 401);
      }

      if (new Date() > session.expiresAt) {
        // Purge expired session
        await prisma.session.delete({ where: { id: session.id } });
        throw new APIError('Session expired.', 401);
      }

      const user = session.user;
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Rotate session token
      const nextExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newRefreshToken,
          expiresAt: nextExpiry,
          ipAddress: ipAddress || session.ipAddress,
          userAgent: userAgent || session.userAgent
        }
      });

      await this.logActivity({
        userId: user.id,
        action: 'REFRESH_TOKEN',
        status: 'SUCCESS',
        ipAddress,
        userAgent
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      await this.logActivity({
        userId: null,
        action: 'REFRESH_TOKEN',
        status: 'FAILED',
        ipAddress,
        userAgent
      });
      throw new APIError('Session token validation failed.', 401);
    }
  }

  // Terminate/Delete Session on logout
  static async terminateSession(refreshToken, ipAddress, userAgent) {
    const session = await prisma.session.findUnique({
      where: { refreshToken }
    });

    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
      await this.logActivity({
        userId: session.userId,
        action: 'LOGOUT',
        status: 'SUCCESS',
        ipAddress,
        userAgent
      });
      await ActivityService.logActivity({
        userId: session.userId,
        action: 'LOGOUT',
        entityType: 'USER',
        entityId: session.userId,
        description: 'User logged out and session terminated'
      });
    }
    return true;
  }

  // Get active user profile
  static async getUserProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      throw new APIError('User profile not found.', 404);
    }

    return user;
  }

  // Update profile attributes
  static async updateProfile(userId, data, ipAddress, userAgent) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new APIError('User account not found.', 404);
    }

    if (data.email && data.email !== user.email) {
      const emailDuplicate = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailDuplicate) {
        throw new APIError('Email address is already in use.', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ?? user.name,
        email: data.email ?? user.email
      },
      select: { id: true, name: true, email: true, role: true }
    });

    await this.logActivity({
      userId: userId,
      action: 'PROFILE_UPDATE',
      status: 'SUCCESS',
      ipAddress,
      userAgent
    });

    return updatedUser;
  }

  // Change user password credentials
  static async changePassword(userId, oldPassword, newPassword, ipAddress, userAgent) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new APIError('User account not found.', 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      await this.logActivity({
        userId: userId,
        action: 'PASSWORD_CHANGE',
        status: 'FAILED',
        ipAddress,
        userAgent
      });
      throw new APIError('Current password is incorrect.', 400);
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    await this.logActivity({
      userId: userId,
      action: 'PASSWORD_CHANGE',
      status: 'SUCCESS',
      ipAddress,
      userAgent
    });

    return true;
  }
}
