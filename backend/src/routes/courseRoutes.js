const express        = require('express');
const router         = express.Router();
const multer         = require('multer');
const path           = require('path');

const courseController             = require('../controllers/courseController');
const courseExportImportController = require('../controllers/courseExportImportController');
const { authenticate, authorize }  = require('../middlewares/authMiddleware');
const upload                       = require('../middlewares/uploadMiddleware');

const importStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/imports'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadImport = multer({ storage: importStorage });

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

// ── Export ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/courses/export:
 *   get:
 *     summary: Export courses (csv, excel, json)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, excel, json] }
 *     responses:
 *       200:
 *         description: File download
 */
router.get(
  '/export',
  authenticate,
  authorize('admin'),
  courseExportImportController.exportCourses
);

// ── Import ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/courses/import:
 *   post:
 *     summary: Import courses from CSV or Excel
 *     tags: [Courses]
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
 *       200:
 *         description: Import result summary
 */
router.post(
  '/import',
  authenticate,
  authorize('admin'),
  uploadImport.single('file'),
  courseExportImportController.importCourses
);

// ── Existing ──────────────────────────────────────────────────
router.get('/',    authenticate, courseController.getAll);
router.get('/:id', authenticate, courseController.getOne);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.single('thumbnail'),
  courseController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  upload.single('thumbnail'),
  courseController.update
);

router.delete('/:id', authenticate, authorize('admin'), courseController.remove);

module.exports = router;
