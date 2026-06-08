const faqRepo = require('../repositories/faqRepository');

// ── Categories ────────────────────────────────────────────────
const getCategories = () => faqRepo.getAllCategories();

const createCategory = ({ name, description, userId }) =>
  faqRepo.createCategory({ name, description, created_by: userId, updated_by: userId });

const updateCategory = async ({ id, name, description, userId }) => {
  const [count] = await faqRepo.updateCategory(id, { name, description, updated_by: userId });
  if (!count) { const err = new Error('Category not found.'); err.status = 404; throw err; }
};

const deleteCategory = async (id) => {
  const count = await faqRepo.deleteCategory(id);
  if (!count) { const err = new Error('Category not found.'); err.status = 404; throw err; }
};

// ── FAQs ──────────────────────────────────────────────────────
const getFaqsByCourse = (course_id) => faqRepo.getFaqsByCourse(course_id);

const createFaq = ({ course_id, faqcategory_id, question, answer, userId }) =>
  faqRepo.createFaq({ course_id, faqcategory_id, question, answer, created_by: userId, updated_by: userId });

const updateFaq = async ({ id, faqcategory_id, question, answer, userId, userRole, requestingProfessorCourseId }) => {
  const faq = await faqRepo.getFaqById(id);
  if (!faq) { const err = new Error('FAQ not found.'); err.status = 404; throw err; }

  // Professors can only edit FAQs belonging to their course
  if (userRole === 'professor' && faq.course_id !== requestingProfessorCourseId) {
    const err = new Error('Forbidden.'); err.status = 403; throw err;
  }

  await faqRepo.updateFaq(id, { faqcategory_id, question, answer, updated_by: userId });
};

const deleteFaq = async ({ id, userRole, requestingProfessorCourseId }) => {
  const faq = await faqRepo.getFaqById(id);
  if (!faq) { const err = new Error('FAQ not found.'); err.status = 404; throw err; }

  if (userRole === 'professor' && faq.course_id !== requestingProfessorCourseId) {
    const err = new Error('Forbidden.'); err.status = 403; throw err;
  }

  await faqRepo.deleteFaq(id);
};

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  getFaqsByCourse, createFaq, updateFaq, deleteFaq,
};