const leadService = require('../services/leadService');

/**
 * Create a new lead (Admin & Manager only).
 */
async function createLead(req, res, next) {
  try {
    const { name, email, phone, source, status, assigned_to, notes } = req.body;

    if (!name || !email || !source) {
      return res.status(400).json({ error: 'Name, email, and source are required' });
    }

    const lead = await leadService.createLead({
      name,
      email,
      phone,
      source,
      status,
      assigned_to,
      notes
    });

    return res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List leads with pagination, filters, and role constraints.
 */
async function listLeads(req, res, next) {
  try {
    const { page, limit, search, sortBy, sortOrder, status, source, assignedTo } = req.query;

    const result = await leadService.listLeads({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      sortBy,
      sortOrder,
      status,
      source,
      assignedTo: assignedTo ? parseInt(assignedTo, 10) : null,
      userId: req.user.id,
      userRole: req.user.role
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get lead details by ID.
 */
async function getLeadById(req, res, next) {
  try {
    const { id } = req.params;
    const lead = await leadService.getLeadById(parseInt(id, 10), {
      userId: req.user.id,
      userRole: req.user.role
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found or access denied' });
    }

    return res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a lead.
 */
async function updateLead(req, res, next) {
  try {
    const { id } = req.params;
    const leadId = parseInt(id, 10);

    // Fetch the lead first to check authorization
    const lead = await leadService.getLeadById(leadId, {
      userId: req.user.id,
      userRole: req.user.role
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found or access denied' });
    }

    // Role restrictions on updates
    const updates = { ...req.body };

    // Agents cannot reassign leads
    if (req.user.role === 'agent' && updates.assigned_to !== undefined) {
      delete updates.assigned_to;
    }

    const updatedLead = await leadService.updateLead(leadId, updates);
    return res.status(200).json({
      message: 'Lead updated successfully',
      lead: updatedLead
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a lead (Admin & Manager only).
 */
async function deleteLead(req, res, next) {
  try {
    const { id } = req.params;
    const deletedLead = await leadService.deleteLead(parseInt(id, 10));

    if (!deletedLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.status(200).json({
      message: 'Lead deleted successfully',
      lead: deletedLead
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createLead,
  listLeads,
  getLeadById,
  updateLead,
  deleteLead
};
