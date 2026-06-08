const CourseFaq   = require('../models/sql/CourseFaq');
const FaqCategory = require('../models/sql/FaqCategory');

// ── FAQ Categories ────────────────────────────────────────────
const getAllCategories = () => FaqCategory.findAll({ order: [['name', 'ASC']] });

const createCategory = (data) => FaqCategory.create(data);

const updateCategory = (id, data) =>
  FaqCategory.update(data, { where: { id } });

const deleteCategory = (id) =>
  FaqCategory.destroy({ where: { id } });

// ── Course FAQs ───────────────────────────────────────────────
const getFaqsByCourse = (course_id) =>
  CourseFaq.findAll({
    where: { course_id },
    include: [{ model: FaqCategory, as: 'category', attributes: ['id', 'name'] }],
    order: [['faqcategory_id', 'ASC'], ['id', 'ASC']],
  });

const getFaqById = (id) =>
  CourseFaq.findByPk(id, {
    include: [{ model: FaqCategory, as: 'category', attributes: ['id', 'name'] }],
  });

const createFaq = (data) => CourseFaq.create(data);

const updateFaq = (id, data) =>
  CourseFaq.update(data, { where: { id } });

const deleteFaq = (id) =>
  CourseFaq.destroy({ where: { id } });

module.exports = {
  getAllCategories, createCategory, updateCategory, deleteCategory,
  getFaqsByCourse, getFaqById, createFaq, updateFaq, deleteFaq,
};