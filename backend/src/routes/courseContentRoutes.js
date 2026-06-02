const router = require('express').Router();
const controller = require('../controllers/courseContentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const lessonUpload = require("../middlewares/lessonUploadMiddleware");

// Sections
router.get('/sections/:courseId', authenticate, controller.getSections);

router.post(
  '/sections',
  authenticate,
  authorize('admin', 'professor'),
  controller.createSection
);

router.put(
  '/sections/:id',
  authenticate, 
  authorize('admin', 'professor'),
  controller.updateSection
);

router.delete(
  '/sections/:id',
  authenticate,
  authorize('admin', 'professor'),
  controller.deleteSection
);



module.exports = router;