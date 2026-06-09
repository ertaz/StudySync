const express           = require('express');
const router            = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Settings
 *     description: API për konfigurimet dhe cilësimet e sistemit
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Merr të gjitha konfigurimet (Admin)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sukses
 */
router.get('/',     authenticate, authorize('admin'), settingController.getAll);

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     summary: Përditëson vlerën e një konfigurimi
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
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
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 example: "Vlera e re"
 *     responses:
 *       200:
 *         description: Konfigurimi u përditësua me sukses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
router.put('/:key', authenticate, authorize('admin'), settingController.update);

module.exports = router;