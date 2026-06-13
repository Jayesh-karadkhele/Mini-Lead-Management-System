const activityService = require('../services/activityService');

/**
 * Get recent global activity logs (Admin & Manager only).
 */
async function getRecentActivities(req, res, next) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const activities = await activityService.getRecentGlobalActivities(limit);
    return res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecentActivities
};
