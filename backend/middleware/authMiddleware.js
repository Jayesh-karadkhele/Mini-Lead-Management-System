const { verifyAccessToken } = require('../utils/jwtHelper');

/**
 * Middleware to authenticate requests using JWT Access Token.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Expecting format: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware to authorize requests based on user roles.
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to perform this action' 
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
