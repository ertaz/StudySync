const router = require('express').Router();
const controller = require('../controllers/courseContentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const lessonUpload = require("../middlewares/lessonUploadMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Course Content
 *     description: API për menaxhimin e seksioneve dhe mësimeve të kursit
 */

// Sections
router.get('/sections/:courseId', authenticate, controller.getSections);

router.post(
  '/sections',
  authenticate,
  authorize('admin', 'professor'),
  controller.createSection
);

/**
 * @swagger
 * /api/course-content/sections/{id}:
 *   put:
 *     summary: Përditëson një seksion ekzistues
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e seksionit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seksioni u përditësua me sukses
 *
 *   delete:
 *     summary: Fshin një seksion
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e seksionit që do të fshihet
 *     responses:
 *       200:
 *         description: Seksioni u fshi me sukses
 */
router.put(
  '/sections/:id',
  authenticate, 
  authorize('admin', 'professor'),
  controller.updateSection
);

router.delete(
  '/sections/:id',
  authenticate,
  authorize('admin', 'professor'),
  controller.deleteSection
);

// Lessons

/**
 * @swagger
 * /api/course-content/lessons:
 *   post:
 *     summary: Krijon një mësim të ri
 *     tags: [Course Content]
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
 *               - sectionId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Hyrje në Node.js"
 *               content:
 *                 type: string
 *                 example: "Përmbajtja e mësimit..."
 *               sectionId:
 *                 type: string
 *                 example: "60d5ecb8b392d215c8f58f3f"
 *     responses:
 *       201:
 *         description: Mësimi u krijua me sukses
 */
router.post(
  "/lessons",
  authenticate,
  authorize("admin", "professor"),
  lessonUpload.single("file"),
  controller.createLesson
);

/**
 * @swagger
 * /api/course-content/lessons/{id}:
 *   get:
 *     summary: Merr detajet e një mësimi specifik
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e mësimit
 *     responses:
 *       200:
 *         description: Sukses
 *
 *   put:
 *     summary: Përditëson një mësim ekzistues
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e mësimit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mësimi u përditësua me sukses
 *
 *   delete:
 *     summary: Fshin një mësim
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ja e mësimit që do të fshihet
 *     responses:
 *       200:
 *         description: Mësimi u fshi me sukses
 */
router.put(
  "/lessons/:id",
  authenticate,
  authorize("admin", "professor"),
  lessonUpload.single("file"),
  controller.updateLesson
);

router.delete(
  '/lessons/:id',
  authenticate,
  authorize('admin', 'professor'),
  controller.deleteLesson
);

module.exports = router;