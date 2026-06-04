const Submission     = require('../models/sql/Submission');
const SubmissionFile = require('../models/sql/SubmissionFile');
const Assignment     = require('../models/sql/Assignment');
const User           = require('../models/sql/User');
const File           = require('../models/sql/File');

const submissionIncludes = [
  { model: Assignment, as: 'assignment' },
  { model: User, as: 'student', attributes: ['id', 'first_name', 'last_name', 'email'] },
  { model: SubmissionFile, as: 'submissionFiles', include: [{ model: File, as: 'file' }] },
];

const getAll = ({ filter, sort, order } = {}) => {
  const where = {};
  if (filter === 'late')   where.is_late = 1;
  if (filter === 'ontime') where.is_late = 0;
  const sortField = ['submitted_at', 'created_at'].includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  return Submission.findAll({ where, include: submissionIncludes, order: [[sortField, sortOrder]] });
};

const getByAssignment = (assignmentId, { filter, sort, order } = {}) => {
  const where = { assignment_id: assignmentId };
  if (filter === 'late')   where.is_late = 1;
  if (filter === 'ontime') where.is_late = 0;
  const sortField = ['submitted_at', 'created_at'].includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  return Submission.findAll({ where, include: submissionIncludes, order: [[sortField, sortOrder]] });
};

const getByUser = (userId) =>
  Submission.findAll({ where: { user_id: userId }, include: submissionIncludes, order: [['created_at', 'DESC']] });

const findById = (id) =>
  Submission.findByPk(id, { include: submissionIncludes });

const findExistingSubmission = (assignment_id, user_id) =>
  Submission.findOne({ where: { assignment_id, user_id } });

const create  = (data) => Submission.create(data);
const update  = (id, data) => Submission.update(data, { where: { id } });
const destroy = (id) => Submission.destroy({ where: { id } });

module.exports = { getAll, findById, getByAssignment, getByUser, findExistingSubmission, create, update, destroy };