const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Course category endpoints
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, categoryController.getAll);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       403:
 *         description: Forbidden - admin only
 */
router.post('/', authenticate, authorize('admin'), categoryController.create);

module.exports = router;
