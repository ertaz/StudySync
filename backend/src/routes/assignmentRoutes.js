const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const controller = require('../controllers/assignmentController');
const submissionController = require('../controllers/submissionController');
const exportController = require('../controllers/assignmentExportController');
const importController = require('../controllers/assignmentImportController');

const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { checkEnrolled } = require('../middlewares/enrollmentMiddleware');

// ── Sigurohu qe direktorite ekzistojne ──
const assignmentUploadDir = path.join(__dirname, '../../uploads/assignments');
const importUploadDir = path.join(__dirname, '../../uploads/imports');
if (!fs.existsSync(assignmentUploadDir)) fs.mkdirSync(assignmentUploadDir, { recursive: true });
if (!fs.existsSync(importUploadDir)) fs.mkdirSync(importUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, assignmentUploadDir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const importStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, importUploadDir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const uploadImport = multer({ storage: importStorage });

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Assignment management endpoints
 */

/**
 * @swagger
 * /api/assignments/stats:
 *   get:
 *     summary: Get assignment stats for current user
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats object
 */
router.get('/stats', authenticate, controller.getStats);

/**
 * @swagger
 * /api/assignments/export:
 *   get:
 *     summary: Export assignments (csv, excel, json)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel, json]
 *     responses:
 *       200:
 *         description: File download
 */
router.get(
  '/export',
  authenticate,
  authorize('admin', 'professor'),
  exportController.exportAssignments
);

/**
 * @swagger
 * /api/assignments/import:
 *   post:
 *     summary: Import assignments from CSV or Excel
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Assignments imported
 */
router.post(
  '/import',
  authenticate,
  authorize('professor'),
  uploadImport.single('file'),
  importController.importAssignments
);

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all assignments (filtered by role)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema: { type: string }
 *       - in: query
 *         name: description
 *         schema: { type: string }
 *       - in: query
 *         name: course_id
 *         schema: { type: integer }
 *       - in: query
 *         name: due_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: due_to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of assignments
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get assignment by ID with files
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Assignment found
 */
router.get('/:id', authenticate, controller.getOne);

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create assignment (professor only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               course_id: { type: integer }
 *               deadline: { type: string, format: date-time }
 *               max_grade: { type: number }
 *               files:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Assignment created
 */
router.post(
  '/',
  authenticate,
  authorize('professor'),
  upload.array('files'),
  controller.create
);

/**
 * @swagger
 * /api/assignments/{id}:
 *   put:
 *     summary: Update assignment (professor only, own assignments)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Assignment updated
 */
router.put(
  '/:id',
  authenticate,
  authorize('professor'),
  upload.array('files'),
  controller.update
);

/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Delete assignment (professor only, own assignments)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Assignment deleted
 */
router.delete(
  '/:id',
  authenticate,
  authorize('professor'),
  controller.remove
);

/**
 * @swagger
 * /api/assignments/{id}/attachments/{fileId}:
 *   delete:
 *     summary: Delete a specific attachment from assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
router.delete(
  '/:id/attachments/:fileId',
  authenticate,
  authorize('professor'),
  controller.removeAttachment
);

/**
 * @swagger
 * /api/assignments/{assignmentId}/submissions:
 *   get:
 *     summary: Get submissions for assignment (professor and admin)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of submissions
 */
router.get(
  '/:assignmentId/submissions',
  authenticate,
  authorize('admin', 'professor'),
  submissionController.getByAssignment
);

module.exports = router;