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
 */
router.get(
  '/:id',
  authenticate,
  controller.getOne
);

/**
 * @swagger
 * /api/submissions/user/{userId}:
 *   get:
 *     summary: Get submissions by user
 *     tags: [Submissions]
 */
router.get(
  '/user/:userId',
  authenticate,
  controller.getByUser
);

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Submit assignment (students only, enrolled only)
 *     tags: [Submissions]
 */
router.post(
  '/',
  authenticate,
  authorize('student'),
  checkEnrolled,
  upload.single('file'),
  controller.create
);

/**
 * @swagger
 * /api/submissions/{id}:
 *   put:
 *     summary: Grade submission (professor/admin only)
 *     tags: [Submissions]
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
 */
router.delete(
  '/:id',
  authenticate,
  controller.remove
);

module.exports = router;