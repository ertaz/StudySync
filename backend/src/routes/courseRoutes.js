const express  = require('express');
const router   = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload   = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, courseController.getAll);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a single course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course object
 *       404:
 *         description: Course not found
 */
router.get('/:id', authenticate, courseController.getOne);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, created_by]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               professor_id:
 *                 type: integer
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Course created
 *       403:
 *         description: Forbidden - admin only
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.single('thumbnail'),
  courseController.create
);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course (admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               professor_id:
 *                 type: integer
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course updated
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Course not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  upload.single('thumbnail'),
  courseController.update
);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course (admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course deleted
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Course not found
 */
router.delete('/:id', authenticate, authorize('admin'), courseController.remove);

module.exports = router;
