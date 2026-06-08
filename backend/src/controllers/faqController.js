const faqService = require('../services/faqService');

// ── Categories ────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const data = await faqService.getCategories();
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = await faqService.createCategory({ name, description, userId: req.user.id });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    await faqService.updateCategory({ id: req.params.id, name, description, userId: req.user.id });
    res.json({ success: true, message: 'Category updated.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await faqService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── FAQs ──────────────────────────────────────────────────────
const getFaqsByCourse = async (req, res) => {
  try {
    const data = await faqService.getFaqsByCourse(req.params.courseId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const createFaq = async (req, res) => {
  try {
    const { course_id, faqcategory_id, question, answer } = req.body;
    const data = await faqService.createFaq({
      course_id, faqcategory_id, question, answer, userId: req.user.id,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const updateFaq = async (req, res) => {
  try {
    const { faqcategory_id, question, answer } = req.body;
    await faqService.updateFaq({
      id: req.params.id,
      faqcategory_id, question, answer,
      userId: req.user.id,
      userRole: req.user.role,
      requestingProfessorCourseId: req.user.course_id ?? null,
    });
    res.json({ success: true, message: 'FAQ updated.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const deleteFaq = async (req, res) => {
  try {
    await faqService.deleteFaq({
      id: req.params.id,
      userRole: req.user.role,
      requestingProfessorCourseId: req.user.course_id ?? null,
    });
    res.json({ success: true, message: 'FAQ deleted.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  getFaqsByCourse, createFaq, updateFaq, deleteFaq,
};