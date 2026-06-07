// src/routes/profileRoutes.js
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/profileController');
const { authenticate } = require('../middlewares/authMiddleware');
const { updateProfileRules, validate } = require('../middlewares/profileValidation');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Logged-in user profile management
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get the current user's full profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user info + role-specific profile fields
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, controller.getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Update the current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *               major:
 *                 type: string
 *                 description: Student only
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Student only
 *               phone_number:
 *                 type: string
 *               title:
 *                 type: string
 *                 description: Professor only
 *               department:
 *                 type: string
 *                 description: Professor only
 *               years_of_experience:
 *                 type: integer
 *                 description: Professor only
 *     responses:
 *       200:
 *         description: Profile updated, returns full updated profile
 *       400:
 *         description: Validation error or wrong current password
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authenticate, updateProfileRules, validate, controller.updateMyProfile);

module.exports = router;