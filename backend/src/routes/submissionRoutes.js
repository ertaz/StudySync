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
 * GET /api/submissions
 * Get all submissions (professor/admin only)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'professor'),
  controller.getAll
);

/**
 * GET /api/submissions/:id
 * Get submission by ID
 */
router.get(
  '/:id',
  authenticate,
  controller.getOne
);

/**
 * GET /api/submissions/user/:userId
 * Get submissions by user
 */
router.get(
  '/user/:userId',
  authenticate,
  controller.getByUser
);

/**
 * POST /api/submissions
 * Submit assignment (students only, enrolled only)
 */
router.post(
  '/',
  authenticate,
  authorize('student'),

  // IMPORTANT: check access BEFORE file upload
  checkEnrolled,

  upload.single('file'),

  controller.create
);

/**
 * PUT /api/submissions/:id
 * Grade submission (professor/admin only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'professor'),
  controller.update
);

/**
 * DELETE /api/submissions/:id
 * Delete submission
 */
router.delete(
  '/:id',
  authenticate,
  controller.remove
);

module.exports = router;