const { Op } = require('sequelize');
const Assignment = require('../models/sql/Assignment');
const Course = require('../models/sql/Course');
const File = require('../models/sql/File');
const Enrollment = require('../models/sql/Enrollment');
const Submission = require('../models/sql/Submission');

// ─────────────────────────────────────────────
// GET ALL
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
// GET STATS (FIXED)
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

  const ids = assignments.map(a => a.id);

  const submittedCount = await Submission.count({
    where: {
      assignment_id: { [Op.in]: ids }
    }
  });

  const overdue = assignments.filter(
    a => a.deadline && new Date(a.deadline) < now
  ).length;

  const total = assignments.length;

  return {
    total,
    submitted: submittedCount,
    overdue,
    pending: Math.max(total - submittedCount - overdue, 0)
  };
};

module.exports = {
  getAll,
  getStats
};