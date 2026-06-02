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

// Lessons


router.post(
  "/lessons",
  authenticate,
  authorize("admin", "professor"),
  lessonUpload.single("file"),
  controller.createLesson
);

router.put(
  "/lessons/:id",
  authenticate,
  authorize("admin", "professor"),
  lessonUpload.single("file"),
  controller.updateLesson
);

router.delete(
  '/lessons/:id',
  authenticate,
  authorize('admin', 'professor'),
  controller.deleteLesson
);



module.exports = router;