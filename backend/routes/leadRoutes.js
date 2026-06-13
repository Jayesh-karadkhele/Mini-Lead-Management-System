const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All lead routes require authentication
router.use(authenticateToken);

router.post('/', authorizeRoles('admin', 'manager'), leadController.createLead);
router.get('/', leadController.listLeads);
router.get('/:id', leadController.getLeadById);
router.get('/:id/activities', leadController.getLeadActivities);
router.put('/:id', leadController.updateLead);
router.delete('/:id', authorizeRoles('admin', 'manager'), leadController.deleteLead);

module.exports = router;
