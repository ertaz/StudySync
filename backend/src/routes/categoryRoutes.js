const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');

const categoryController           = require('../controllers/categoryController');
const categoryExportImportController = require('../controllers/categoryExportImportController');
const { authenticate, authorize }  = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission'); 

const importStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/imports'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadImport = multer({ storage: importStorage });

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Course category endpoints
 */

// ── Export ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/categories/export:
 *   get:
 *     summary: Export categories (csv, excel, json)
 *     tags: [Categories]
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
  categoryExportImportController.exportCategories
);

// ── Import ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/categories/import:
 *   post:
 *     summary: Import categories from CSV or Excel
 *     tags: [Categories]
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
  categoryExportImportController.importCategories
);

// ── Existing ──────────────────────────────────────────────────
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', authenticate, categoryController.getAll);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', authenticate, checkPermission('category:create'), categoryController.create);

module.exports = router;
