const { Op } = require('sequelize');
const Assignment = require('../models/sql/Assignment');
const Course = require('../models/sql/Course');
const Enrollment = require('../models/sql/Enrollment');
const Submission = require('../models/sql/Submission');

// ─────────────────────────────────────────────
// GET ALL (unchanged)
// ─────────────────────────────────────────────
const getAll = async (filters = {}) => {
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

  if (filters.due_from || filters.due_to) {
    where.deadline = {};
    if (filters.due_from) where.deadline[Op.gte] = new Date(filters.due_from);
    if (filters.due_to) where.deadline[Op.lte] = new Date(filters.due_to);
  }

  return Assignment.findAll({
    where,
    include: [{ model: Course, as: 'course' }],
    order: [['created_at', 'DESC']]
  });
};

// ─────────────────────────────────────────────
// FIXED STATS (CORRECT VERSION)
// ─────────────────────────────────────────────
const getStats = async (userId, role) => {
  const now = new Date();

  let assignments = [];

  // ───────── professor
  if (role === 'professor') {
    assignments = await Assignment.findAll({
      where: { created_by: userId },
      attributes: ['id', 'deadline']
    });
  }

  // ───────── student
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

  // ───────── admin
  else {
    assignments = await Assignment.findAll({
      attributes: ['id', 'deadline']
    });
  }

  const assignmentIds = assignments.map(a => a.id);

  // ✅ FIX 1: unique submissions per assignment (not total rows only)
  const submittedCount = await Submission.count({
    distinct: true,
    col: 'assignment_id',
    where: {
      assignment_id: { [Op.in]: assignmentIds }
    }
  });

  // ✅ FIX 2: overdue only counts assignments past deadline
  const overdueCount = assignments.filter(
    a => a.deadline && new Date(a.deadline) < now
  ).length;

  const total = assignments.length;

  // ✅ FIX 3: correct pending logic
  const pending = Math.max(total - submittedCount, 0);

  return {
    total,
    submitted: submittedCount,
    overdue: overdueCount,
    pending
  };
};

module.exports = {
  getAll,
  getStats
};