const authService = require('../services/authService');
const { generateAccessToken } = require('../utils/jwtHelper');

/**
 * Register a new user.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (role && !['admin', 'manager', 'agent'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, manager, or agent' });
    }

    const user = await authService.registerUser({ name, email, password, role });

    // Auto-login after registration
    const authData = await authService.authenticateUser(email, password);

    return res.status(201).json({
      message: 'User registered successfully',
      ...authData
    });
  } catch (error) {
    if (error.message === 'Email is already registered') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * Login user.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const authData = await authService.authenticateUser(email, password);

    return res.status(200).json({
      message: 'Login successful',
      ...authData
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * Refresh access token using a refresh token.
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Find and validate refresh token in db
    const activeToken = await authService.findRefreshToken(refreshToken);
    if (!activeToken) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: activeToken.user_id,
      name: activeToken.name,
      email: activeToken.email,
      role: activeToken.role
    });

    return res.status(200).json({
      accessToken,
      refreshToken // Send back same token (or rotate it if preferred, keeping it simple here)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user.
 */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    await authService.deleteRefreshToken(refreshToken);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user details.
 */
async function me(req, res) {
  // req.user is populated by authenticateToken middleware
  return res.status(200).json({ user: req.user });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
