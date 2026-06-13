const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All lead routes require authentication
router.use(authenticateToken);

/**
 * @openapi
 * /api/leads:
 *   post:
 *     summary: Create a new lead (Admin & Manager only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, source]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dave Miller
 *               email:
 *                 type: string
 *                 example: dave@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+14155552671"
 *               source:
 *                 type: string
 *                 example: web
 *               status:
 *                 type: string
 *                 enum: [new, contacted, qualified, proposal, won, lost]
 *                 example: new
 *               assigned_to:
 *                 type: integer
 *                 description: ID of the agent to assign this lead to. Auto-assigned to least-loaded agent if omitted.
 *                 example: 3
 *               notes:
 *                 type: string
 *                 example: "Inquired about pricing plans."
 *     responses:
 *       201:
 *         description: Lead created and assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Agents cannot create leads)
 * 
 *   get:
 *     summary: List leads with search, sorting, filtering, and pagination
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, source, status, created_at, updated_at]
 *           default: created_at
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter leads by status
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter leads by source
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: Filter leads by assigned agent ID (Admins/Managers only)
 *     responses:
 *       200:
 *         description: A paginated list of leads. (Agents only see their assigned leads)
 */
router.post('/', authorizeRoles('admin', 'manager'), leadController.createLead);
router.get('/', leadController.listLeads);

/**
 * @openapi
 * /api/leads/{id}:
 *   get:
 *     summary: Get lead details by ID
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lead details including assignee and enrichment metadata
 *       404:
 *         description: Lead not found or access denied
 * 
 *   put:
 *     summary: Update a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               source:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [new, contacted, qualified, proposal, won, lost]
 *               assigned_to:
 *                 type: integer
 *                 description: Admin/Manager only
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead updated successfully
 *       404:
 *         description: Lead not found or access denied
 * 
 *   delete:
 *     summary: Delete a lead (Admin & Manager only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lead deleted successfully
 *       404:
 *         description: Lead not found
 */
router.get('/:id', leadController.getLeadById);
router.get('/:id/activities', leadController.getLeadActivities);
router.put('/:id', leadController.updateLead);
router.delete('/:id', authorizeRoles('admin', 'manager'), leadController.deleteLead);

module.exports = router;
