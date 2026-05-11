const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// GET /api/categories  — available to all logged-in users (for dropdowns)
router.get('/', authenticate, categoryController.getAll);

// POST /api/categories  — admin only
router.post('/', authenticate, authorize('admin'), categoryController.create);

module.exports = router;
