import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

// Verifies the access token present inside request headers
export const authenticateUser = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication session token required.',
        errors: []
      });
    }

    // Verify token signature against secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid: User account not found.',
        errors: []
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired.',
        errors: []
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Access token credentials invalid.',
      errors: []
    });
  }
};

// Verifies if user holds authorization scopes
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permissions to perform this action.',
        errors: []
      });
    }
    next();
  };
};
