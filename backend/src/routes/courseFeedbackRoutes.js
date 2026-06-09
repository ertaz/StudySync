const express = require('express');
const router = express.Router();

const controller = require('../controllers/courseFeedbackController');

const {
  authenticate,
  authorize,
} = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Course Feedback
 *     description: API për vlerësimet dhe feedback-un e kurseve
 */

/**
 * @swagger
 * /api/course-feedback:
 *   post:
 *     summary: Shto feedback për një kurs
 *     tags: [Course Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - rating
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "60d5ecb8b392d215c8f58f3f"
 *               rating:
 *                 type: number
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Kurs i shkëlqyer!"
 *     responses:
 *       201:
 *         description: Feedback u shtua me sukses
 */
router.post(
  '/',
  authenticate,
  authorize('student'),
  controller.create
);

/**
 * @swagger
 * /api/course-feedback:
 *   get:
 *     summary: Merr të gjitha feedback-et (Admin)
 *     tags: [Course Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sukses
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  controller.getAll
);

/**
 * @swagger
 * /api/course-feedback/course/{courseId}:
 *   get:
 *     summary: Merr të gjitha feedback-et për një kurs
 *     tags: [Course Feedback]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukses
 */
router.get(
    '/course/:courseId',
    authenticate,
    authorize('admin'),
    controller.getByCourse
  );

/**
 * @swagger
 * /api/course-feedback/{id}/reviewed:
 *   patch:
 *     summary: Shëno feedback-un si të shqyrtuar
 *     tags: [Course Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukses
 */
router.patch(
  '/:id/reviewed',
  authenticate,
  authorize('admin'),
  controller.markReviewed
);

/**
 * @swagger
 * /api/course-feedback/{id}:
 *   delete:
 *     summary: Fshij një feedback
 *     tags: [Course Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukses
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  controller.remove
);

module.exports = router;