const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// POST /api/enrollments/:courseId   — student enrolls
router.post('/:courseId', authenticate, authorize('student'), controller.enroll);

// GET  /api/enrollments/me          — get all my enrolled courses
router.get('/me', authenticate, controller.getMyEnrollments);

// GET  /api/enrollments/check/:courseId — check if I'm enrolled
router.get('/check/:courseId', authenticate, controller.checkEnrollment);

module.exports = router;