const express = require("express");
const router = express.Router();
// Shto controller-in tënd nëse e ke, p.sh:
// const controller = require("../controllers/chatController");

const { authenticate } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: API për menaxhimin e bisedave (Chat History)
 */

/**
 * @swagger
 * /api/chat/{courseId}/history:
 *   get:
 *     summary: Merr historikun e bisedave për një kurs
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e kursit
 *     responses:
 *       200:
 *         description: Historiku u mor me sukses
 */
router.get("/:courseId/history", authenticate, (req, res) => {
  res.json({ msg: "Chat history placeholder" });
});

module.exports = router;