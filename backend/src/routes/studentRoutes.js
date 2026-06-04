const express    = require('express');
const router     = express.Router();
const multer     = require('multer');

const studentExportImportController = require('../controllers/studentExportImportController');
const { authenticate, authorize }   = require('../middlewares/authMiddleware');

const importStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/imports'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadImport = multer({ storage: importStorage });

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management endpoints
 */

// ── Export ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/students/export:
 *   get:
 *     summary: Export students (csv, excel, json)
 *     tags: [Students]
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
  studentExportImportController.exportStudents
);

// ── Import ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/students/import:
 *   post:
 *     summary: Import students from CSV or Excel
 *     tags: [Students]
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
  studentExportImportController.importStudents
);

module.exports = router;
