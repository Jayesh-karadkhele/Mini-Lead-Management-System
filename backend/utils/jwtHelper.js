const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_54321';
const ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '15m';
const REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Generate a short-lived access token for a user.
 */
function generateAccessToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRE });
}

/**
 * Generate a long-lived refresh token for a user.
 */
function generateRefreshToken(user) {
  const payload = { id: user.id };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE });
}

/**
 * Verify an access token.
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token.
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
