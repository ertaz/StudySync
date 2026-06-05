const router     = require('express').Router();
const controller = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { checkEnrolled }           = require('../middlewares/enrollmentMiddleware');
const upload                      = require('../middlewares/submissionUploadMiddleware');

router.get('/',
  authenticate,
  authorize('admin', 'professor'),
  controller.getAll
);

router.get('/user/:userId',
  authenticate,
  controller.getByUser
);

router.get('/assignment/:assignmentId',
  authenticate,
  authorize('admin', 'professor'),
  controller.getByAssignment
);

// ✅ Student sheh submission e tij për një assignment
router.get('/my/:assignmentId',
  authenticate,
  authorize('student'),
  controller.getMySubmission
);

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

// ✅ Student shton file të reja tek submission ekzistuese
router.post(
  '/:id/files',
  authenticate,
  authorize('student'),
  upload.array('files', 10),
  controller.addFiles
);

router.put('/:id',
  authenticate,
  authorize('professor'), // ✅ vetëm professor — admin nuk modifikon submission
  controller.update
);

// ✅ Grade submission — vetëm professor
router.patch('/:id/grade',
  authenticate,
  authorize('professor'),
  controller.update
);

// ✅ Student fshin një file të vetme nga submission e tij
router.delete('/files/:fileId',
  authenticate,
  authorize('student'),
  controller.removeFile
);

router.delete('/:id',
  authenticate,
  authorize('professor'), // ✅ vetëm professor — admin nuk fshin submission
  controller.remove
);

module.exports = router;