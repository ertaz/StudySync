const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Course enrollment endpoints
 */

/**
 * @swagger
 * /api/enrollments/{courseId}:
 *   post:
 *     summary: Enroll in a course (student only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Enrolled successfully
 *       403:
 *         description: Forbidden - student only
 *       409:
 *         description: Already enrolled
 */
router.post('/:courseId', authenticate, authorize('student'), controller.enroll);

/**
 * @swagger
 * /api/enrollments/me:
 *   get:
 *     summary: Get all courses I am enrolled in
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, controller.getMyEnrollments);

/**
 * @swagger
 * /api/enrollments/check/{courseId}:
 *   get:
 *     summary: Check if I am enrolled in a specific course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns enrolled true/false
 *       401:
 *         description: Unauthorized
 */
router.get('/check/:courseId', authenticate, controller.checkEnrollment);

module.exports = router;
