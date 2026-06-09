const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: FAQ
 *     description: API për menaxhimin e pyetjeve të shpeshta dhe kategorive
 */

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
router.get("/categories", (req, res) => {
  res.json([]);
});

router.post("/categories", (req, res) => {
  res.json({ ok: true });
});

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
router.put("/categories/:id", (req, res) => {
  res.json({ ok: true });
});

router.delete("/categories/:id", (req, res) => {
  res.json({ ok: true });
});

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
router.get("/", (req, res) => {
  res.json([]);
});

router.post("/", (req, res) => {
  res.json({ ok: true });
});

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
router.put("/:id", (req, res) => {
  res.json({ ok: true });
});

router.delete("/:id", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;