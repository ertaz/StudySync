const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/',            authenticate, ctrl.getAll);
router.patch('/read-all',  authenticate, ctrl.markAllRead); 
router.patch('/:id/read',  authenticate, ctrl.markRead);     

module.exports = router;