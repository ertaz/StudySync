const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Contact
 *     description: API për mesazhet e kontaktit nga përdoruesit
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Dërgon një mesazh të ri kontakti
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Filan Fisteku"
 *               email:
 *                 type: string
 *                 example: "filan@example.com"
 *               message:
 *                 type: string
 *                 example: "Kam një pyetje rreth platformës."
 *     responses:
 *       201:
 *         description: Mesazhi u dërgua me sukses
 */
router.post("/", (req, res) => {
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/contact/{id}/read:
 *   patch:
 *     summary: Shënon mesazhin si të lexuar (Vetëm Admin)
 *     tags: [Contact]
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
 *         description: Përditësuar me sukses
 */
router.patch("/:id/read", authenticate, authorize("admin"), (req, res) => {
  res.json({ ok: true });
});

module.exports = router;