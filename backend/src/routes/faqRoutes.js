const express    = require('express');
const router     = express.Router();
const faqCtrl    = require('../controllers/faqController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: FAQ
 *     description: API për menaxhimin e pyetjeve të shpeshta dhe kategorive
 */

// ── FAQ Categories (admin only) ───────────────────────────────

/**
 * @swagger
 * /api/faq/categories:
 *   get:
 *     summary: Merr të gjitha kategoritë e FAQ
 *     tags: [FAQ]
 *     responses:
 *       200:
 *         description: Sukses
 *
 *   post:
 *     summary: Krijon një kategori të re
 *     tags: [FAQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ndihmë Teknike"
 *     responses:
 *       201:
 *         description: Kategoria u krijua
 */
router.get   ('/categories',     authenticate, faqCtrl.getCategories);
router.post  ('/categories',     authenticate, authorize('admin'), faqCtrl.createCategory);

/**
 * @swagger
 * /api/faq/categories/{id}:
 *   put:
 *     summary: Përditëson një kategori ekzistuese
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: U përditësua me sukses
 *
 *   delete:
 *     summary: Fshin një kategori FAQ
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: U fshi me sukses
 */
router.put   ('/categories/:id', authenticate, authorize('admin'), faqCtrl.updateCategory);
router.delete('/categories/:id', authenticate, authorize('admin'), faqCtrl.deleteCategory);

// ── Course FAQs ───────────────────────────────────────────────
// Students, professors, and admins can view
router.get('/course/:courseId', authenticate, faqCtrl.getFaqsByCourse);

/**
 * @swagger
 * /api/faq:
 *   get:
 *     summary: Merr të gjitha pyetjet FAQ
 *     tags: [FAQ]
 *     responses:
 *       200:
 *         description: Sukses
 *
 *   post:
 *     summary: Krijon një FAQ të re
 *     tags: [FAQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *               - categoryId
 *             properties:
 *               question:
 *                 type: string
 *                 example: "Si të ndërroj fjalëkalimin?"
 *               answer:
 *                 type: string
 *                 example: "Shko tek profili dhe kliko ndrysho fjalëkalimin."
 *               categoryId:
 *                 type: string
 *                 example: "60d5ecb8b392d215c8f58f3f"
 *     responses:
 *       201:
 *         description: FAQ u krijua me sukses
 */
// Only admin and professor can create/edit/delete
router.post  ('/',     authenticate, authorize('admin', 'professor'), faqCtrl.createFaq);

/**
 * @swagger
 * /api/faq/{id}:
 *   put:
 *     summary: Përditëson një FAQ ekzistuese
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: U përditësua
 *
 *   delete:
 *     summary: Fshin një FAQ
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: U fshi
 */
router.put   ('/:id',  authenticate, authorize('admin', 'professor'), faqCtrl.updateFaq);
router.delete('/:id',  authenticate, authorize('admin', 'professor'), faqCtrl.deleteFaq);

module.exports = router;