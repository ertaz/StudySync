const express        = require('express');
const router         = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/',        authenticate, authorize('admin'), settingController.getAll);
router.put('/:key',    authenticate, authorize('admin'), settingController.update);

module.exports = router;