const express    = require('express');
const router     = express.Router();
const multer     = require('multer');

const professorController              = require('../controllers/professorController');
const professorExportImportController  = require('../controllers/professorExportImportController');
const { authenticate, authorize }      = require('../middlewares/authMiddleware');

const importStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/imports'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadImport = multer({ storage: importStorage });

/**
 * @swagger
 * tags:
 * name: Professors
 * description: Professor management endpoints
 */

// ── Export ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/professors/export:
 * get:
 * summary: Export professors (csv, excel, json)
 * tags: [Professors]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: format
 * schema: { type: string, enum: [csv, excel, json] }
 * responses:
 * - 200:
 * description: File download
 */
router.get(
  '/export',
  authenticate,
  authorize('admin'),
  professorExportImportController.exportProfessors
);

// ── Import ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/professors/import:
 * post:
 * summary: Import professors from CSV or Excel
 * tags: [Professors]
 * security:
 * - bearerAuth: []
 * requestBody:
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * file:
 * type: string
 * format: binary
 * responses:
 * - 200:
 * description: Import result summary
 */
router.post(
  '/import',
  authenticate,
  authorize('admin'),
  uploadImport.single('file'),
  professorExportImportController.importProfessors
);

// ── Existing professor endpoints (from professorController) ───
/**
 * @swagger
 * /api/professors:
 * get:
 * summary: Get all professors
 * tags: [Professors]
 * security:
 * - bearerAuth: []
 * responses:
 * - 200:
 * description: List of professors
 */
router.get('/', authenticate, authorize('admin'), professorController.getAllProfessors);

/**
 * @swagger
 * /api/professors/{id}:
 * get:
 * summary: Get professor by ID
 * tags: [Professors]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * - 200:
 * description: Professor object
 */
router.get('/:id', authenticate, authorize('admin'), professorController.getProfessorById);

module.exports = router;