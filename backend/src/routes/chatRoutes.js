const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/chatController');
const { authenticate } = require('../middlewares/authMiddleware');

// GET /api/chat/:courseId/history
router.get('/:courseId/history', authenticate, controller.getHistory);

module.exports = router;