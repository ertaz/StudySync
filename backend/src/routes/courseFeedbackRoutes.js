const express = require('express');
const router = express.Router();

const controller =
  require('../controllers/courseFeedbackController');

const {
  authenticate,
  authorize,
} = require('../middlewares/authMiddleware');

router.post(
  '/',
  authenticate,
  authorize('student'),
  controller.create
);

router.get(
  '/',
  authenticate,
  authorize('admin'),
  controller.getAll
);

router.get(
    '/course/:courseId',
    authenticate,
    authorize('admin'),
    controller.getByCourse
  );

router.patch(
  '/:id/reviewed',
  authenticate,
  authorize('admin'),
  controller.markReviewed
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  controller.remove
);

module.exports = router;