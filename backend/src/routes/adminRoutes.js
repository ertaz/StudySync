const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/professorController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { createProfessorRules, validate } = require('../middlewares/professorValidation');

// All admin routes require:
// 1. authenticate — valid JWT access token
// 2. authorize('admin') — role must be admin

router.post(
  '/professors',
  authenticate,
  authorize('admin'),
  createProfessorRules,
  validate,
  controller.createProfessor
);

router.get(
  '/professors',
  authenticate,
  authorize('admin'),
  controller.getAllProfessors
);

module.exports = router;