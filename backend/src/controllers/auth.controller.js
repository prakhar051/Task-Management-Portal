import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validations/auth.validation.js';

// Cookie setup configurations helper
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = async (req, res) => {
  const parsedData = registerSchema.parse(req.body);
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const user = await AuthService.registerUser(parsedData, ipAddress, userAgent);

  res.status(201).json({
    success: true,
    message: 'User account registered successfully.',
    data: { user }
  });
};

export const login = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const { user, accessToken, refreshToken } = await AuthService.loginUser(email, password, ipAddress, userAgent);

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    data: { user, accessToken }
  });
};

export const refresh = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  if (!oldRefreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token session required.',
      errors: []
    });
  }

  const { accessToken, refreshToken } = await AuthService.rotateSession(oldRefreshToken, ipAddress, userAgent);

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token session rotated successfully.',
    data: { accessToken }
  });
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  if (refreshToken) {
    await AuthService.terminateSession(refreshToken, ipAddress, userAgent);
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    success: true,
    message: 'Session logged out successfully.'
  });
};

export const me = async (req, res) => {
  const userProfile = await AuthService.getUserProfile(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Profile details retrieved successfully.',
    data: { user: userProfile }
  });
};

export const updateProfile = async (req, res) => {
  const parsedData = updateProfileSchema.parse(req.body);
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const updatedUser = await AuthService.updateProfile(req.user.id, parsedData, ipAddress, userAgent);

  res.status(200).json({
    success: true,
    message: 'Profile attributes updated successfully.',
    data: { user: updatedUser }
  });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  await AuthService.changePassword(req.user.id, oldPassword, newPassword, ipAddress, userAgent);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
    data: null
  });
};
