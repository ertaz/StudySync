const express    = require('express');
const router     = express.Router();
const faqCtrl    = require('../controllers/faqController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ── FAQ Categories (admin only) ───────────────────────────────
router.get   ('/categories',     authenticate, faqCtrl.getCategories);
router.post  ('/categories',     authenticate, authorize('admin'), faqCtrl.createCategory);
router.put   ('/categories/:id', authenticate, authorize('admin'), faqCtrl.updateCategory);
router.delete('/categories/:id', authenticate, authorize('admin'), faqCtrl.deleteCategory);

// ── Course FAQs ───────────────────────────────────────────────
// Students, professors, and admins can view
router.get('/course/:courseId', authenticate, faqCtrl.getFaqsByCourse);

// Only admin and professor can create/edit/delete
router.post  ('/',     authenticate, authorize('admin', 'professor'), faqCtrl.createFaq);
router.put   ('/:id',  authenticate, authorize('admin', 'professor'), faqCtrl.updateFaq);
router.delete('/:id',  authenticate, authorize('admin', 'professor'), faqCtrl.deleteFaq);

module.exports = router;