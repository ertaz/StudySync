const express = require('express');
const router  = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Logged in users only
router.post('/', authenticate, contactController.sendMessage);

// Admin only
router.get('/',           authenticate, authorize('admin'), contactController.getAllMessages);
router.patch('/:id/read', authenticate, authorize('admin'), contactController.markAsRead);

module.exports = router;