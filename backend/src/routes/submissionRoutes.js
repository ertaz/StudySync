const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Submissions
 *     description: API për menaxhimin e dorëzimeve të detyrave (Submissions)
 */

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Dorëzon një detyrë të re
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignmentId
 *               - fileUrl
 *             properties:
 *               assignmentId:
 *                 type: string
 *                 example: "60d5ecb8b392d215c8f58f3f"
 *               fileUrl:
 *                 type: string
 *                 example: "https://bucket.com/detyra.pdf"
 *     responses:
 *       201:
 *         description: Detyra u dorëzua me sukses
 */
router.post("/", (req, res) => {
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Merr detajet e një dorëzimi specifik
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukses
 *
 *   put:
 *     summary: Ndryshon ose përditëson dorëzimin
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
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
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dorëzimi u përditësua
 */
router.get("/:id", (req, res) => {
  res.json({});
});

router.put("/:id", (req, res) => {
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/submissions/{id}/grade:
 *   post:
 *     summary: Vlerëson (noton) një dorëzim detyre
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - grade
 *             properties:
 *               grade:
 *                 type: number
 *                 example: 9.5
 *               feedback:
 *                 type: string
 *                 example: "Punë e shkëlqyer!"
 *     responses:
 *       200:
 *         description: Dorëzimi u vlerësua me sukses
 */
router.post("/:id/grade", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;