const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Course Content
 *     description: API për menaxhimin e seksioneve dhe mësimeve të kursit
 */

/**
 * @swagger
 * /api/course-content/sections/{id}:
 *   put:
 *     summary: Përditëson një seksion ekzistues
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e seksionit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seksioni u përditësua me sukses
 *
 *   delete:
 *     summary: Fshin një seksion
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e seksionit që do të fshihet
 *     responses:
 *       200:
 *         description: Seksioni u fshi me sukses
 */
router.put("/sections/:id", (req, res) => {
  res.json({ ok: true });
});

router.delete("/sections/:id", (req, res) => {
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/course-content/lessons:
 *   post:
 *     summary: Krijon një mësim të ri
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - sectionId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Hyrje në Node.js"
 *               content:
 *                 type: string
 *                 example: "Përmbajtja e mësimit..."
 *               sectionId:
 *                 type: string
 *                 example: "60d5ecb8b392d215c8f58f3f"
 *     responses:
 *       201:
 *         description: Mësimi u krijua me sukses
 */
router.post("/lessons", (req, res) => {
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/course-content/lessons/{id}:
 *   get:
 *     summary: Merr detajet e një mësimi specifik
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e mësimit
 *     responses:
 *       200:
 *         description: Sukses
 *
 *   put:
 *     summary: Përditëson një mësim ekzistues
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e mësimit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mësimi u përditësua me sukses
 *
 *   delete:
 *     summary: Fshin një mësim
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e mësimit që do të fshihet
 *     responses:
 *       200:
 *         description: Mësimi u fshi me sukses
 */
router.get("/lessons/:id", (req, res) => {
  res.json({});
});

router.put("/lessons/:id", (req, res) => {
  res.json({ ok: true });
});

router.delete("/lessons/:id", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;