const express = require('express');

const router = express.Router();

const {
  authenticate,
  authorize
} = require('../middlewares/authMiddleware');

const upload =
  require('../middlewares/noteUploadMiddleware');

const controller =
  require('../controllers/courseNoteController');

router.get(
  '/course/:courseId',
  authenticate,
  controller.getNotes
);

router.post(
  '/',
  authenticate,
  authorize('student'),
  upload.single('file'),
  controller.uploadNote
);

router.delete(
  '/:id',
  authenticate,
  controller.deleteNote
);

module.exports = router;