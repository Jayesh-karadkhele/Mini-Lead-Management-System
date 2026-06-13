const { query } = require('../config/db');

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

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens
};
