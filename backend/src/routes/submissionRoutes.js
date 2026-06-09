const router     = require('express').Router();
const controller = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { checkEnrolled }           = require('../middlewares/enrollmentMiddleware');
const upload                      = require('../middlewares/submissionUploadMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Submissions
 *     description: API për menaxhimin e dorëzimeve të detyrave (Submissions)
 */

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Merr të gjitha dorëzimet (Admin & Professor)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sukses
 *
 *   post:
 *     summary: Dorëzon një detyrë të re
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignmentId
 *               - fileUrl
 *             properties:
 *               assignmentId:
 *                 type: string
 *                 example: "60d5ecb8b392d215c8f58f3f"
 *               fileUrl:
 *                 type: string
 *                 example: "https://bucket.com/detyra.pdf"
 *     responses:
 *       201:
 *         description: Detyra u dorëzua me sukses
 */
router.get('/',
  authenticate,
  authorize('admin', 'professor'),
  controller.getAll
);

/**
 * @swagger
 * /api/submissions/user/{userId}:
 *   get:
 *     summary: Merr dorëzimet e një përdoruesi specifik
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukses
 */
router.get('/user/:userId',
  authenticate,
  controller.getByUser
);

/**
 * @swagger
 * /api/submissions/assignment/{assignmentId}:
 *   get:
 *     summary: Merr dorëzimet për një detyrë specifike (Admin & Professor)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukses
 */
router.get('/assignment/:assignmentId',
  authenticate,
  authorize('admin', 'professor'),
  controller.getByAssignment
);

/**
 * @swagger
 * /api/submissions/my/{assignmentId}:
 *   get:
 *     summary: Studenti sheh submission e tij për një assignment
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukses
 */
router.get('/my/:assignmentId',
  authenticate,
  authorize('student'),
  controller.getMySubmission
);

/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Merr detajet e një dorëzimi specifik
 *     tags: [Submissions]
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
 *         description: Sukses
 *
 *   put:
 *     summary: Ndryshon ose përditëson dorëzimin (Professor)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dorëzimi u përditësua
 */
router.get('/:id',
  authenticate,
  controller.getOne
);

router.post(
  '/',
  authenticate,
  authorize('student'),
  upload.array('files', 10),
  checkEnrolled,
  controller.create
);

/**
 * @swagger
 * /api/submissions/{id}/files:
 *   post:
 *     summary: Studenti shton file të reja tek submission ekzistuese
 *     tags: [Submissions]
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
 *         description: Skedarët u shtuan me sukses
 */
router.post(
  '/:id/files',
  authenticate,
  authorize('student'),
  upload.array('files', 10),
  controller.addFiles
);

router.put('/:id',
  authenticate,
  authorize('professor'),
  controller.update
);

/**
 * @swagger
 * /api/submissions/{id}/grade:
 *   patch:
 *     summary: Vlerëson (noton) një dorëzim detyre (Professor)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - grade
 *             properties:
 *               grade:
 *                 type: number
 *                 example: 9.5
 *               feedback:
 *                 type: string
 *                 example: "Punë e shkëlqyer!"
 *     responses:
 *       200:
 *         description: Dorëzimi u vlerësua me sukses
 */
router.patch('/:id/grade',
  authenticate,
  authorize('professor'),
  controller.update
);

/**
 * @swagger
 * /api/submissions/files/{fileId}:
 *   delete:
 *     summary: Studenti fshin një file të vetme nga submission e tij
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skedari u fshi me sukses
 */
router.delete('/files/:fileId',
  authenticate,
  authorize('student'),
  controller.removeFile
);

/**
 * @swagger
 * /api/submissions/{id}:
 *   delete:
 *     summary: Fshin një dorëzim (Professor)
 *     tags: [Submissions]
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
 *         description: Dorëzimi u fshi me sukses
 */
router.delete('/:id',
  authenticate,
  authorize('professor'),
  controller.remove
);

module.exports = router;