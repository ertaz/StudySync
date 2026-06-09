const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Course Notes
 *     description: API për shënimet personale të studentëve në kurse
 */

/**
 * @swagger
 * /api/course-notes:
 *   post:
 *     summary: Krijon një shënim të ri
 *     tags: [Course Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - note
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "60d5ecb8b392d215c8f58f3f"
 *               note:
 *                 type: string
 *                 example: "Kjo është një pjesë e rëndësishme për provim."
 *     responses:
 *       201:
 *         description: Shënimi u krijua
 */
router.post("/", authenticate, (req, res) => {
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/course-notes/course/{courseId}:
 *   get:
 *     summary: Merr shënimet për një kurs specifik
 *     tags: [Course Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukses
 */
router.get("/course/:courseId", authenticate, (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /api/course-notes/{id}:
 *   delete:
 *     summary: Fshin një shënim
 *     tags: [Course Notes]
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
 */
router.delete("/:id", authenticate, (req, res) => {
  res.json({ ok: true });
});

module.exports = router;