const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Settings
 *     description: API për konfigurimet dhe cilësimet e sistemit
 */

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Merr vlerën e një konfigurimi specifik përmes çelësit (key)
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Çelësi i konfigurimit (p.sh. site_name)
 *     responses:
 *       200:
 *         description: Sukses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 value:
 *                   type: string
 */

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     summary: Përditëson vlerën e një konfigurimi
 *     tags: [Settings]
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

router.get("/:key", (req, res) => {
  res.json({});
});

router.put("/:key", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;