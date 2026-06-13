const { query } = require('../config/db');

/**
 * Log a lead activity in the database.
 */
async function createActivityLog({ leadId, userId, activityType, details }) {
  try {
    const sql = `
      INSERT INTO activity_logs (lead_id, user_id, activity_type, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await query(sql, [leadId, userId, activityType, details]);
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create activity log:', error.message);
    // Don't throw error to avoid crashing the main request if logging fails
    return null;
  }
}

/**
 * Get activity logs for a specific lead.
 */
async function getActivityLogsForLead(leadId) {
  const sql = `
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.lead_id = $1
    ORDER BY al.created_at DESC
  `;
  const result = await query(sql, [leadId]);
  return result.rows;
}

/**
 * Get the most recent global activity logs across all leads.
 */
async function getRecentGlobalActivities(limit = 10, { userId, userRole } = {}) {
  let whereClause = '';
  const params = [limit];

  if (userRole === 'agent') {
    whereClause = 'WHERE l.assigned_to = $2';
    params.push(userId);
  }

  const sql = `
    SELECT al.*, u.name as user_name, l.name as lead_name
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    JOIN leads l ON al.lead_id = l.id
    ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT $1
  `;
  const result = await query(sql, [limit]);
  return result.rows;
}

module.exports = {
  createActivityLog,
  getActivityLogsForLead,
  getRecentGlobalActivities
};
