const express = require('express');
const router  = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

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

// Logged in users only
router.post('/', authenticate, contactController.sendMessage);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Merr të gjitha mesazhet (Admin)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista e mesazheve u mor me sukses
 */

// Admin only
router.get('/',           authenticate, authorize('admin'), contactController.getAllMessages);

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
router.patch('/:id/read', authenticate, authorize('admin'), contactController.markAsRead);

module.exports = router;