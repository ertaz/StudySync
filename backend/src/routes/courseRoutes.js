// src/routes/courseRoutes.js
const express  = require('express');
const router   = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload   = require('../middlewares/uploadMiddleware');

// GET /courses        — all authenticated users
router.get('/',    authenticate, courseController.getAll);

// GET /courses/:id    — all authenticated users
router.get('/:id', authenticate, courseController.getOne);

// POST /courses       — admin only
router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.single('thumbnail'),
  courseController.create
);

// PUT /courses/:id    — admin only
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  upload.single('thumbnail'),
  courseController.update
);

// DELETE /courses/:id — admin only
router.delete('/:id', authenticate, authorize('admin'), courseController.remove);

module.exports = router;
