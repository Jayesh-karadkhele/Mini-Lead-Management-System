const { query } = require('../config/db');
const { createActivityLog } = require('./activityService');

/**
 * Find the active agent with the least number of assigned leads.
 */
async function getLeastLoadedAgent() {
  const sql = `
    SELECT u.id
    FROM users u
    LEFT JOIN leads l ON u.id = l.assigned_to AND l.status NOT IN ('won', 'lost')
    WHERE u.role = 'agent'
    GROUP BY u.id
    ORDER BY COUNT(l.id) ASC, u.id ASC
    LIMIT 1
  `;
  const result = await query(sql);
  return result.rows[0] ? result.rows[0].id : null;
}

/**
 * Create a new lead.
 */
async function createLead({ name, email, phone, source, status = 'new', assigned_to = null, notes = '', creatorId, creatorRole }) {
  let finalAssignedTo = assigned_to;

  // Auto-assign to least-loaded agent if no specific assignment is provided
  if (!finalAssignedTo && (creatorRole === 'manager' || creatorRole === 'admin')) {
    finalAssignedTo = await getLeastLoadedAgent();
  }

  const sql = `
    INSERT INTO leads (name, email, phone, source, status, assigned_to, notes, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  const result = await query(sql, [name, email, phone, source, status, finalAssignedTo, notes]);
  const lead = result.rows[0];

  // Log lead creation activity
  await createActivityLog({
    leadId: lead.id,
    userId: creatorId,
    activityType: 'lead_created',
    details: `Lead '${lead.name}' was created.`
  });

  // Log lead assignment activity if assigned
  if (lead.assigned_to) {
    const agentResult = await query('SELECT name FROM users WHERE id = $1', [lead.assigned_to]);
    const agentName = agentResult.rows[0] ? agentResult.rows[0].name : `Agent ID ${lead.assigned_to}`;
    await createActivityLog({
      leadId: lead.id,
      userId: creatorId,
      activityType: 'lead_assigned',
      details: `Lead was assigned to ${agentName}.`
    });
  }

  // Trigger lead enrichment asynchronously in the background
  const { enrichLead } = require('./enrichmentService');
  enrichLead(lead.id).catch(err => console.error('Enrichment background task failed:', err.message));

  return lead;
}

/**
 * Get a lead by ID, including assignee details.
 */
async function getLeadById(id, { userId, userRole }) {
  let sql = `
    SELECT l.*, u.name as assignee_name, u.email as assignee_email
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    WHERE l.id = $1
  `;
  const params = [id];

  // Agent role boundary check
  if (userRole === 'agent') {
    sql += ' AND l.assigned_to = $2';
    params.push(userId);
  }

  const result = await query(sql, params);
  return result.rows[0] || null;
}

/**
 * List leads with pagination, search, sorting, and filters.
 */
async function listLeads({
  page = 1,
  limit = 10,
  search = '',
  sortBy = 'created_at',
  sortOrder = 'DESC',
  status = '',
  source = '',
  assignedTo = null,
  userId,
  userRole
}) {
  const offset = (page - 1) * limit;
  
  // Base query construction
  let whereClauses = [];
  const params = [];
  let paramIndex = 1;

  // Role restriction: Agents see only their assigned leads
  if (userRole === 'agent') {
    whereClauses.push(`l.assigned_to = $${paramIndex}`);
    params.push(userId);
    paramIndex++;
  } else if (assignedTo) {
    // Admins/Managers can filter by assignee
    whereClauses.push(`l.assigned_to = $${paramIndex}`);
    params.push(assignedTo);
    paramIndex++;
  }

  if (search) {
    whereClauses.push(`(l.name ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex} OR l.phone ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    whereClauses.push(`l.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (source) {
    whereClauses.push(`l.source = $${paramIndex}`);
    params.push(source);
    paramIndex++;
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Validate sorting fields to prevent SQL injection
  const allowedSortFields = ['name', 'email', 'source', 'status', 'created_at', 'updated_at'];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  // Count total leads matching criteria
  const countSql = `
    SELECT COUNT(*) 
    FROM leads l
    ${whereString}
  `;
  const countResult = await query(countSql, params);
  const totalLeads = parseInt(countResult.rows[0].count, 10);

  // Fetch paginated leads
  const fetchParams = [...params, limit, offset];
  const limitIndex = paramIndex;
  const offsetIndex = paramIndex + 1;

  const fetchSql = `
    SELECT l.*, u.name as assignee_name, u.email as assignee_email
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    ${whereString}
    ORDER BY l.${safeSortBy} ${safeSortOrder}
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const fetchResult = await query(fetchSql, fetchParams);

  return {
    leads: fetchResult.rows,
    pagination: {
      total: totalLeads,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(totalLeads / limit)
    }
  };
}

/**
 * Update a lead.
 */
async function updateLead(id, updateFields, updaterId) {
  // Fetch current lead to compare updates
  const currentResult = await query('SELECT * FROM leads WHERE id = $1', [id]);
  const currentLead = currentResult.rows[0];
  if (!currentLead) return null;

  const allowedUpdates = ['name', 'email', 'phone', 'source', 'status', 'assigned_to', 'notes'];
  
  const setClauses = [];
  const params = [id];
  let paramIndex = 2;

  for (const [key, value] of Object.entries(updateFields)) {
    if (allowedUpdates.includes(key)) {
      setClauses.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return currentLead;
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  const sql = `
    UPDATE leads
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  const result = await query(sql, params);
  const updatedLead = result.rows[0];

  if (updatedLead) {
    // Log status changed
    if (currentLead.status !== updatedLead.status) {
      await createActivityLog({
        leadId: updatedLead.id,
        userId: updaterId,
        activityType: 'status_changed',
        details: `Status changed from '${currentLead.status}' to '${updatedLead.status}'.`
      });
    }

    // Log lead assigned/reassigned
    if (currentLead.assigned_to !== updatedLead.assigned_to) {
      if (updatedLead.assigned_to) {
        const agentResult = await query('SELECT name FROM users WHERE id = $1', [updatedLead.assigned_to]);
        const agentName = agentResult.rows[0] ? agentResult.rows[0].name : `Agent ID ${updatedLead.assigned_to}`;
        await createActivityLog({
          leadId: updatedLead.id,
          userId: updaterId,
          activityType: 'lead_assigned',
          details: `Lead assigned to ${agentName}.`
        });
      } else {
        await createActivityLog({
          leadId: updatedLead.id,
          userId: updaterId,
          activityType: 'lead_assigned',
          details: `Lead was unassigned.`
        });
      }
    }

    // Log general update
    if (currentLead.status === updatedLead.status && currentLead.assigned_to === updatedLead.assigned_to) {
      const changedFields = Object.keys(updateFields).filter(
        key => allowedUpdates.includes(key) && currentLead[key] !== updatedLead[key]
      );
      if (changedFields.length > 0) {
        await createActivityLog({
          leadId: updatedLead.id,
          userId: updaterId,
          activityType: 'lead_updated',
          details: `Updated fields: ${changedFields.join(', ')}.`
        });
      }
    }
  }

  return updatedLead;
}

/**
 * Delete a lead.
 */
async function deleteLead(id) {
  const sql = 'DELETE FROM leads WHERE id = $1 RETURNING *';
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

module.exports = {
  createLead,
  getLeadById,
  listLeads,
  updateLead,
  deleteLead
};
