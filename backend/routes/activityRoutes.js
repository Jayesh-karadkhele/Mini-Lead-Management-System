const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Only Admin and Manager can fetch recent global activities
router.get('/', authorizeRoles('admin', 'manager'), activityController.getRecentActivities);

module.exports = router;
