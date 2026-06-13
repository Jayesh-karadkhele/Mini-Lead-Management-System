const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

/**
 * @openapi
 * /api/activities:
 *   get:
 *     summary: Retrieve recent global activity logs across all leads (Admin & Manager only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of log rows to return
 *     responses:
 *       200:
 *         description: A list of the most recent activity logs across all leads
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Agents cannot view global activities)
 */
router.get('/', authorizeRoles('admin', 'manager'), activityController.getRecentActivities);

module.exports = router;
