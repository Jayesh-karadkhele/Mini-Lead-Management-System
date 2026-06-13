const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Agent
 *               email:
 *                 type: string
 *                 example: john@company.com
 *               password:
 *                 type: string
 *                 example: agentpassword
 *               role:
 *                 type: string
 *                 enum: [admin, manager, agent]
 *                 example: agent
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Missing fields or invalid role
 *       409:
 *         description: Email already exists
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user credentials
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: manager@company.com
 *               password:
 *                 type: string
 *                 example: managerpassword
 *     responses:
 *       200:
 *         description: Login successful, returns JWT access token and stateful refresh token
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Generate a new access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a fresh JWT access token
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', authController.refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Revoke and invalidate a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token deleted from database successfully
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Retrieve currently logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns current authenticated user metadata
 *       401:
 *         description: Access token missing
 *       403:
 *         description: Invalid or expired token
 */
router.get('/me', authenticateToken, authController.me);

module.exports = router;
