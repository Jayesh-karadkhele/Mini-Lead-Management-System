const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtHelper');

/**
 * Save a new refresh token to the database.
 */
async function saveRefreshToken(userId, token, expiresInDays = 7) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const sql = `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await query(sql, [userId, token, expiresAt]);
  return result.rows[0];
}

/**
 * Find a refresh token in the database.
 */
async function findRefreshToken(token) {
  const sql = `
    SELECT rt.*, u.name, u.email, u.role
    FROM refresh_tokens rt
    JOIN users u ON rt.user_id = u.id
    WHERE rt.token = $1 AND rt.expires_at > CURRENT_TIMESTAMP
  `;
  const result = await query(sql, [token]);
  return result.rows[0];
}

/**
 * Delete a specific refresh token (used on logout).
 */
async function deleteRefreshToken(token) {
  const sql = 'DELETE FROM refresh_tokens WHERE token = $1';
  await query(sql, [token]);
}

/**
 * Delete all refresh tokens for a user (used for global logout/reset password).
 */
async function deleteUserRefreshTokens(userId) {
  const sql = 'DELETE FROM refresh_tokens WHERE user_id = $1';
  await query(sql, [userId]);
}

/**
 * Register a new user in the system.
 */
async function registerUser({ name, email, password, role = 'agent' }) {
  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('Email is already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user
  const sql = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const result = await query(sql, [name, email, passwordHash, role]);
  return result.rows[0];
}

/**
 * Authenticate a user and generate tokens.
 */
async function authenticateUser(email, password) {
  // Find user by email
  const sql = 'SELECT * FROM users WHERE email = $1';
  const result = await query(sql, [email]);
  const user = result.rows[0];

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token to db
  await saveRefreshToken(user.id, refreshToken);

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

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens,
  registerUser,
  authenticateUser
};
