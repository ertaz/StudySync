const router     = require('express').Router();
const controller = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Dynamic report generation endpoints
 */

/**
 * @swagger
 * /api/reports/filters:
 *   get:
 *     summary: Get filter options (professors list, enrollment years)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filter options
 */
router.get(
  '/filters',
  authenticate,
  authorize('admin'), // ✅ vetëm admin — profesori nuk e sheh listën e profesorëve të tjerë
  controller.getFilters
);

/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Export full report (CSV, Excel, JSON)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, excel, json] }
 *       - in: query
 *         name: professorId
 *         schema: { type: integer }
 *       - in: query
 *         name: courseId
 *         schema: { type: integer }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
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

/**
 * @swagger
 * /api/reports/courses/{courseId}:
 *   get:
 *     summary: Get course detail - pie data + submission table
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: sectionId
 *         schema: { type: integer }
 *       - in: query
 *         name: assignmentId
 *         schema: { type: integer }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Course pie data and submission table
 */
router.get(
  '/courses/:courseId',
  authenticate,
  authorize('admin', 'professor'),
  controller.getCourseDetail
);

/**
 * @swagger
 * /api/reports/courses/{courseId}/export:
 *   get:
 *     summary: Export course submission table (CSV, Excel, JSON)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, excel, json] }
 *       - in: query
 *         name: sectionId
 *         schema: { type: integer }
 *       - in: query
 *         name: assignmentId
 *         schema: { type: integer }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: File download
 */
router.get(
  '/courses/:courseId/export',
  authenticate,
  authorize('admin', 'professor'),
  controller.exportCourseTable
);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get full report data (summary + courses)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: professorId
 *         schema: { type: integer }
 *       - in: query
 *         name: courseId
 *         schema: { type: integer }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
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

module.exports = router;