const { Op } = require('sequelize');
const Assignment = require('../models/sql/Assignment');
const Submission = require('../models/sql/Submission');
const Course = require('../models/sql/Course');

const generateReport = async (filters = {}) => {
  const assignmentWhere = {};
  const submissionWhere = {};

  if (filters.course_id) {
    assignmentWhere.course_id = filters.course_id;
  }

  if (filters.date_from || filters.date_to) {
    assignmentWhere.created_at = {};
    if (filters.date_from) assignmentWhere.created_at[Op.gte] = new Date(filters.date_from);
    if (filters.date_to)   assignmentWhere.created_at[Op.lte] = new Date(filters.date_to);
  }

  const assignments = await Assignment.findAll({
    where: assignmentWhere,
    include: [{ model: Course, as: 'course' }]
  });

  const assignmentIds = assignments.map((a) => a.id);
  const now = new Date();

  if (assignmentIds.length > 0) {
    submissionWhere.assignment_id = { [Op.in]: assignmentIds };
  }

  if (filters.date_from || filters.date_to) {
    submissionWhere.created_at = {};
    if (filters.date_from) submissionWhere.created_at[Op.gte] = new Date(filters.date_from);
    if (filters.date_to)   submissionWhere.created_at[Op.lte] = new Date(filters.date_to);
  }

  const submissions = await Submission.findAll({ where: submissionWhere });

  const submittedIds = new Set(submissions.map((s) => s.assignment_id));

  const lateSubmissions = await Submission.findAll({
    where: { ...submissionWhere },
    include: [{
      model: Assignment,
      as: 'assignment',
      where: assignmentWhere
    }]
  });

  let lateCount = 0;
  for (const sub of lateSubmissions) {
    if (sub.assignment && sub.assignment.deadline) {
      if (new Date(sub.created_at) > new Date(sub.assignment.deadline)) {
        lateCount++;
      }
    }
  }

  const total            = assignments.length;
  const totalSubmissions = submissions.length;
  const overdueCount     = assignments.filter(
    (a) => a.deadline && new Date(a.deadline) < now && !submittedIds.has(a.id)
  ).length;

  const completionRate = total > 0
    ? Math.round((submittedIds.size / total) * 100)
    : 0;

  const byCourse = {};
  for (const a of assignments) {
    const courseName = a.course ? a.course.name : 'Unknown';
    if (!byCourse[courseName]) {
      byCourse[courseName] = { total: 0, submitted: 0 };
    }
    byCourse[courseName].total++;
    if (submittedIds.has(a.id)) byCourse[courseName].submitted++;
  }

  return {
    assignments_created:   total,
    assignments_submitted: submittedIds.size,
    total_submissions:     totalSubmissions,
    late_submissions:      lateCount,
    overdue_assignments:   overdueCount,
    completion_rate:       `${completionRate}%`,
    by_course:             byCourse
  };
};

module.exports = { generateReport };
