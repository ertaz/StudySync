const { Op } = require('sequelize');
const Assignment = require('../models/sql/Assignment');
const Course = require('../models/sql/Course');
const CourseSection = require('../models/sql/CourseSection');
const Enrollment = require('../models/sql/Enrollment');
const Submission = require('../models/sql/Submission');

// ─────────────────────────────────────────────
// GET ALL (PROFESSOR ONLY LOGIC)
// ─────────────────────────────────────────────
const getAll = async (filters = {}, userId, role) => {
  const where = {};

  if (filters.title) {
    where.title = { [Op.like]: `%${filters.title}%` };
  }

  if (filters.description) {
    where.description = { [Op.like]: `%${filters.description}%` };
  }

  if (filters.course_id) {
    where.course_id = filters.course_id;
  }

  if (filters.section_id) {
    where.section_id = filters.section_id;
  }

  if (filters.due_from || filters.due_to) {
    where.deadline = {};
    if (filters.due_from) where.deadline[Op.gte] = new Date(filters.due_from);
    if (filters.due_to) where.deadline[Op.lte] = new Date(filters.due_to);
  }

  // 🔥 IMPORTANT: professor sees ONLY his assignments
  if (role === 'professor') {
    where.created_by = userId;
  }

  return Assignment.findAll({
    where,
    include: [
      { model: Course, as: 'course' },
      {
        model: CourseSection,
        as: 'section',
        required: false
      }
    ],
    order: [['created_at', 'DESC']]
  });
};

// ─────────────────────────────────────────────
// STATS (safe + section compatible)
// ─────────────────────────────────────────────
const getStats = async (userId, role) => {
  const now = new Date();

  let assignments = [];

  if (role === 'professor') {
    assignments = await Assignment.findAll({
      where: { created_by: userId },
      attributes: ['id', 'deadline']
    });
  }

  else if (role === 'student') {
    const enrollments = await Enrollment.findAll({
      where: { user_id: userId },
      attributes: ['course_id']
    });

    const courseIds = enrollments.map(e => e.course_id);

    assignments = await Assignment.findAll({
      where: { course_id: { [Op.in]: courseIds } },
      attributes: ['id', 'deadline']
    });
  }

  else {
    assignments = await Assignment.findAll({
      attributes: ['id', 'deadline']
    });
  }

  const assignmentIds = assignments.map(a => a.id);

  const submittedCount = await Submission.count({
    distinct: true,
    col: 'assignment_id',
    where: {
      assignment_id: { [Op.in]: assignmentIds }
    }
  });

  const overdueCount = assignments.filter(
    a => a.deadline && new Date(a.deadline) < now
  ).length;

  return {
    total: assignments.length,
    submitted: submittedCount,
    overdue: overdueCount,
    pending: Math.max(assignments.length - submittedCount, 0)
  };
};

module.exports = {
  getAll,
  getStats
};