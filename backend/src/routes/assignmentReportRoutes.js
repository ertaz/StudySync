const router = require('express').Router();
const controller = require('../controllers/assignmentReportController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Assignment Reports
 *   description: Assignment report endpoints
 */

/**
 * @swagger
 * /api/assignments/reports:
 *   get:
 *     summary: Get assignment report data
 *     tags: [Assignment Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema: { type: integer }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Report data
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'professor'),
  controller.getReport
);

/**
 * @swagger
 * /api/assignments/reports/export:
 *   get:
 *     summary: Export report as PDF, Excel or CSV
 *     tags: [Assignment Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, csv]
 *       - in: query
 *         name: course_id
 *         schema: { type: integer }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: File download
 */
router.get(
  '/export',
  authenticate,
  authorize('admin', 'professor'),
  controller.exportReport
);

module.exports = router;
