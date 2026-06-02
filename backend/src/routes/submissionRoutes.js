const router = require('express').Router();
const controller = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { checkEnrolled } = require('../middlewares/enrollmentMiddleware');
const upload = require('../middlewares/submissionUploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Submission management endpoints
 */

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Get all submissions (professor/admin only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of submissions
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'professor'),
  controller.getAll
);

/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Get submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Submission found
 */
router.get('/:id', authenticate, controller.getOne);

/**
 * @swagger
 * /api/submissions/user/{userId}:
 *   get:
 *     summary: Get submissions by user
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User submissions
 */
router.get('/user/:userId', authenticate, controller.getByUser);

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Submit assignment (enrolled students only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               assignment_id:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Submission created
 */
router.post(
  '/',
  authenticate,
  authorize('student'),
  upload.single('file'),
  checkEnrolled,
  controller.create
);

/**
 * @swagger
 * /api/submissions/{id}:
 *   put:
 *     summary: Grade submission (professor/admin only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Submission updated
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'professor'),
  controller.update
);

/**
 * @swagger
 * /api/submissions/{id}:
 *   delete:
 *     summary: Delete submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Submission deleted
 */
router.delete('/:id', authenticate, controller.remove);

module.exports = router;
