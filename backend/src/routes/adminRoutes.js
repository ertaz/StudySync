const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/professorController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { createProfessorRules, validate } = require('../middlewares/professorValidation');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

/**
 * @swagger
 * /api/admin/professors:
 *   post:
 *     summary: Create a new professor account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               years_of_experience:
 *                 type: integer
 *               phone_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Professor created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - admin only
 */
router.post(
  '/professors',
  authenticate,
  authorize('admin'),
  createProfessorRules,
  validate,
  controller.createProfessor
);

/**
 * @swagger
 * /api/admin/professors:
 *   get:
 *     summary: Get all professors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of professors
 *       403:
 *         description: Forbidden - admin only
 */
router.get(
  '/professors',
  authenticate,
  authorize('admin'),
  controller.getAllProfessors
);

module.exports = router;
