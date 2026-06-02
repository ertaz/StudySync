const { Op } = require('sequelize');
const Assignment = require('../models/sql/Assignment');
const Course = require('../models/sql/Course');
const File = require('../models/sql/File');
const Enrollment = require('../models/sql/Enrollment');

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
    if (filters.due_to)   where.deadline[Op.lte] = new Date(filters.due_to);
  }

  return Assignment.findAll({
    where,
    include: [{ model: Course, as: 'course' }],
    order: [['created_at', 'DESC']]
  });
};

const findById = async (id) =>
  Assignment.findByPk(id, {
    include: [{ model: Course, as: 'course' }]
  });

const getByIdWithFiles = async (id) => {
  const assignment = await Assignment.findByPk(id, {
    include: [{ model: Course, as: 'course' }]
  });

  if (!assignment) return null;

  const files = await File.findAll({
    where: { entity: 'assignment', entity_id: id }
  });

  return { ...assignment.toJSON(), attachments: files };
};

const getByProfessor = async (userId, filters = {}) => {
  const where = { created_by: userId };

  if (filters.title) {
    where.title = { [Op.like]: `%${filters.title}%` };
  }

  if (filters.course_id) {
    where.course_id = filters.course_id;
  }

  if (filters.due_from || filters.due_to) {
    where.deadline = {};
    if (filters.due_from) where.deadline[Op.gte] = new Date(filters.due_from);
    if (filters.due_to)   where.deadline[Op.lte] = new Date(filters.due_to);
  }

  return Assignment.findAll({
    where,
    include: [{ model: Course, as: 'course' }],
    order: [['created_at', 'DESC']]
  });
};

const getByEnrolledStudent = async (userId, filters = {}) => {
  const enrollments = await Enrollment.findAll({
    where: { user_id: userId },
    attributes: ['course_id']
  });

  const courseIds = enrollments.map((e) => e.course_id);

  const where = { course_id: { [Op.in]: courseIds } };

  if (filters.title) {
    where.title = { [Op.like]: `%${filters.title}%` };
  }

  if (filters.course_id && courseIds.includes(Number(filters.course_id))) {
    where.course_id = filters.course_id;
  }

  if (filters.due_from || filters.due_to) {
    where.deadline = {};
    if (filters.due_from) where.deadline[Op.gte] = new Date(filters.due_from);
    if (filters.due_to)   where.deadline[Op.lte] = new Date(filters.due_to);
  }

  return Assignment.findAll({
    where,
    include: [{ model: Course, as: 'course' }],
    order: [['created_at', 'DESC']]
  });
};

const getStats = async (userId, role) => {
  const now = new Date();

  let courseIds = null;

  if (role === 'professor') {
    const assignments = await Assignment.findAll({
      where: { created_by: userId },
      attributes: ['id']
    });
    return buildStats(assignments.map((a) => a.id), now);
  }

  if (role === 'student') {
    const enrollments = await Enrollment.findAll({
      where: { user_id: userId },
      attributes: ['course_id']
    });
    courseIds = enrollments.map((e) => e.course_id);
    const assignments = await Assignment.findAll({
      where: { course_id: { [Op.in]: courseIds } },
      attributes: ['id', 'deadline']
    });
    return buildStats(assignments, now);
  }

  const assignments = await Assignment.findAll({ attributes: ['id', 'deadline'] });
  return buildStats(assignments, now);
};

const buildStats = async (assignments, now) => {
  const Submission = require('../models/sql/Submission');

  const total = assignments.length;
  const ids = assignments.map ? assignments.map((a) => a.id) : assignments;

  const submittedCount = await Submission.count({
    where: { assignment_id: { [Op.in]: ids } }
  });

  const overdue = assignments.filter(
    (a) => a.deadline && new Date(a.deadline) < now
  ).length;

  return {
    total,
    submitted: submittedCount,
    pending: total - submittedCount - overdue < 0 ? 0 : total - submittedCount - overdue,
    overdue
  };
};

const create = (data) => Assignment.create(data);

const update = (id, data) =>
  Assignment.update(data, { where: { id } });

const destroy = (id) =>
  Assignment.destroy({ where: { id } });

module.exports = {
  getAll,
  findById,
  getByIdWithFiles,
  getByProfessor,
  getByEnrolledStudent,
  getStats,
  create,
  update,
  destroy
};
