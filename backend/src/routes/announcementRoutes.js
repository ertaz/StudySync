const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const {
  getAnnouncementsByCourse,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

/**
 * @swagger
 * tags:
 *   - name: Announcements
 *     description: API për menaxhimin e njoftimeve (Announcements)
 */

/**
 * @swagger
 * /api/announcements/test:
 *   get:
 *     summary: Teston nëse rruga e njoftimeve funksionon
 *     tags: [Announcements]
 *     responses:
 *       200:
 *         description: Sukses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/announcements/course/{courseId}:
 *   get:
 *     summary: Merr të gjitha njoftimet për një kurs specifik
 *     tags: [Announcements]
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
 *         description: Lista e njoftimeve u mor me sukses
 *       401:
 *         description: I paautorizuar (mungon tokeni)
 */
// GET by course
router.get("/course/:courseId", authenticate, getAnnouncementsByCourse);

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Krijon një njoftim të ri
 *     description: Qasja është e lejuar vetëm për rolet admin dhe professor.
 *     tags: [Announcements]
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
 *               - content
 *               - courseId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Njoftim i rëndësishëm"
 *               content:
 *                 type: string
 *                 example: "Ligjërata e nesërme shtyhet për në ora 14:00."
 *               courseId:
 *                 type: string
 *                 example: "60d5ecb8b392d215c8f58f3f"
 *     responses:
 *       201:
 *         description: Njoftimi u krijua me sukses
 *       401:
 *         description: I paautorizuar
 *       403:
 *         description: Nuk keni privilegje (nuk jeni Admin ose Professor)
 */
// CREATE
router.post("/", authenticate, authorize("admin", "professor"), createAnnouncement);

/**
 * @swagger
 * /api/announcements/{id}:
 *   put:
 *     summary: Përditëson një njoftim ekzistues
 *     description: Qasja është e lejuar vetëm për rolet admin dhe professor.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e njoftimit që do të përditësohet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Titulli i ri"
 *               content:
 *                 type: string
 *                 example: "Përmbajtja e re e njoftimit"
 *     responses:
 *       200:
 *         description: Njoftimi u përditësua me sukses
 *       401:
 *         description: I paautorizuar
 *       403:
 *         description: Nuk keni privilegje
 *       404:
 *         description: Njoftimi nuk u gjet
 *
 *   delete:
 *     summary: Fshin një njoftim
 *     description: Qasja është e lejuar vetëm për rolet admin dhe professor.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e njoftimit që do të fshihet
 *     responses:
 *       200:
 *         description: Njoftimi u fshi me sukses
 *       401:
 *         description: I paautorizuar
 *       403:
 *         description: Nuk keni privilegje
 *       404:
 *         description: Njoftimi nuk u gjet
 */
// UPDATE
router.put("/:id", authenticate, authorize("admin", "professor"), updateAnnouncement);

// DELETE
router.delete("/:id", authenticate, authorize("admin", "professor"), deleteAnnouncement);

module.exports = router;