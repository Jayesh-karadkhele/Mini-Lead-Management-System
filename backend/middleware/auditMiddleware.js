const { query } = require('../config/db');

/**
 * Middleware to log request and response metadata into the database audit_logs table.
 */
function auditMiddleware(req, res, next) {
  res.on('finish', () => {
    // req.user will be populated if the route went through authenticateToken middleware
    const userId = req.user ? req.user.id : null;
    const method = req.method;
    const url = req.originalUrl || req.url;
    // Get client IP address
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const statusCode = res.statusCode;

    // Skip log insertion for health checks or status routes to avoid database noise
    if (url.includes('/health') || url.includes('/status')) {
      return;
    }

    const sql = `
      INSERT INTO audit_logs (user_id, method, url, ip, status_code)
      VALUES ($1, $2, $3, $4, $5)
    `;

    query(sql, [userId, method, url, ip, statusCode])
      .catch((err) => {
        console.error('Failed to write audit log to database:', err.message);
      });
  });

  next();
}

module.exports = auditMiddleware;
