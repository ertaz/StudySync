const { Op, fn, col, literal } = require('sequelize');
const sequelize        = require('../config/db');
const Course           = require('../models/sql/Course');
const CourseSection    = require('../models/sql/CourseSection');
const Assignment       = require('../models/sql/Assignment');
const Submission       = require('../models/sql/Submission');
const Enrollment       = require('../models/sql/Enrollment');
const User             = require('../models/sql/User');
const StudentProfile   = require('../models/sql/StudentProfile');
const ProfessorProfile = require('../models/sql/ProfessorProfile');
const Category         = require('../models/sql/Category');

// ─────────────────────────────────────────────
// GLOBAL SUMMARY METRICS
// Returns total students, active courses, submission rate, unsubmitted count
// Filtered by: professorId, courseId, dateFrom, dateTo
// ─────────────────────────────────────────────
const getGlobalSummary = async ({ professorId, courseId, dateFrom, dateTo } = {}) => {
  const courseWhere = {};
  if (professorId) courseWhere.professor_id = professorId;
  if (courseId)    courseWhere.id            = courseId;

  const courses = await Course.findAll({
    where:      courseWhere,
    attributes: ['id'],
  });
  const courseIds = courses.map(c => c.id);

  if (!courseIds.length) {
    return { totalStudents: 0, activeCourses: 0, submissionRate: 0, unsubmittedCount: 0 };
  }

  // Unique enrolled students across filtered courses
  const enrollmentRows = await Enrollment.findAll({
    where:      { course_id: { [Op.in]: courseIds } },
    attributes: [[fn('COUNT', fn('DISTINCT', col('user_id'))), 'cnt']],
    raw:        true,
  });
  const totalStudents = parseInt(enrollmentRows[0]?.cnt || 0);

  // Assignments in date range
  const assignmentWhere = { course_id: { [Op.in]: courseIds } };
  if (dateFrom || dateTo) {
    assignmentWhere.created_at = {};
    if (dateFrom) assignmentWhere.created_at[Op.gte] = new Date(dateFrom);
    if (dateTo)   assignmentWhere.created_at[Op.lte] = new Date(dateTo);
  }

  const assignments = await Assignment.findAll({
    where:      assignmentWhere,
    attributes: ['id'],
  });
  const assignmentIds   = assignments.map(a => a.id);
  const totalAssignments = assignmentIds.length;

  // Assignments that have at least one submission
  let submittedCount = 0;
  if (totalAssignments > 0) {
    const rows = await Submission.findAll({
      where: { assignment_id: { [Op.in]: assignmentIds } },
      attributes: [[fn('COUNT', fn('DISTINCT', col('assignment_id'))), 'cnt']],
      raw: true,
    });
    submittedCount = parseInt(rows[0]?.cnt || 0);
  }

  const submissionRate   = totalAssignments > 0
    ? Math.round((submittedCount / totalAssignments) * 100)
    : 0;
  const unsubmittedCount = totalAssignments - submittedCount;

  return {
    totalStudents,
    activeCourses:    courseIds.length,
    submissionRate,
    unsubmittedCount,
    totalAssignments,
  };
};

// ─────────────────────────────────────────────
// COURSES LIST FOR REPORT (with per-course metrics)
// ─────────────────────────────────────────────
const getCoursesForReport = async ({ professorId, courseId, dateFrom, dateTo } = {}) => {
  const courseWhere = {};
  if (professorId) courseWhere.professor_id = professorId;
  if (courseId)    courseWhere.id            = courseId;

  const courses = await Course.findAll({
    where:   courseWhere,
    include: [
      { model: User,     as: 'professor', attributes: ['id', 'first_name', 'last_name'] },
      { model: Category, as: 'category',  attributes: ['id', 'name'] },
      {
        model:    CourseSection,
        as:       'sections',
        attributes: ['id', 'title'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  const result = await Promise.all(courses.map(async (course) => {
    // Student count for this course
    const studentCount = await Enrollment.count({ where: { course_id: course.id } });

    // Assignments (filtered by date)
    const asgWhere = { course_id: course.id };
    if (dateFrom || dateTo) {
      asgWhere.created_at = {};
      if (dateFrom) asgWhere.created_at[Op.gte] = new Date(dateFrom);
      if (dateTo)   asgWhere.created_at[Op.lte] = new Date(dateTo);
    }

    const assignments = await Assignment.findAll({
      where: asgWhere,
      attributes: ['id'],
    });
    const assignmentIds    = assignments.map(a => a.id);
    const totalAssignments = assignmentIds.length;

    let withSubmission    = 0;
    let withoutSubmission = 0;

    if (totalAssignments > 0) {
      const rows = await Submission.findAll({
        where:      { assignment_id: { [Op.in]: assignmentIds } },
        attributes: [[fn('COUNT', fn('DISTINCT', col('assignment_id'))), 'cnt']],
        raw:        true,
      });
      withSubmission    = parseInt(rows[0]?.cnt || 0);
      withoutSubmission = totalAssignments - withSubmission;
    }

    return {
      id:               course.id,
      title:            course.title,
      professor:        course.professor
        ? `${course.professor.first_name} ${course.professor.last_name}`
        : 'N/A',
      professorId:      course.professor?.id || null,
      category:         course.category?.name || 'N/A',
      sectionsCount:    course.sections?.length || 0,
      sections:         course.sections || [],
      studentCount,
      totalAssignments,
      withSubmission,
      withoutSubmission,
    };
  }));

  return result;
};

// ─────────────────────────────────────────────
// SUBMISSION TABLE FOR A COURSE
// Filters: sectionId, assignmentId, dateFrom, dateTo
// Returns rows: studentId, studentName, section, assignment, submittedAt, grade
// ─────────────────────────────────────────────
const getCourseSubmissionTable = async (courseId, { sectionId, assignmentId, dateFrom, dateTo } = {}) => {
  // Build assignment filter
  const asgWhere = { course_id: courseId };
  if (sectionId)    asgWhere.section_id = sectionId;
  if (assignmentId) asgWhere.id         = assignmentId;

  const assignments = await Assignment.findAll({
    where:   asgWhere,
    include: [{ model: CourseSection, as: 'section', attributes: ['id', 'title'] }],
    attributes: ['id', 'title'],
  });

  if (!assignments.length) return [];

  const assignmentIds = assignments.map(a => a.id);
  const asgMap        = {};
  assignments.forEach(a => { asgMap[a.id] = a; });

  // All enrolled students in this course
  const enrollments = await Enrollment.findAll({
    where:   { course_id: courseId },
    include: [{
      model:   User,
      as:      'student',
      attributes: ['id', 'first_name', 'last_name'],
      include: [{
        model:      StudentProfile,
        as:         'studentProfile',
        attributes: ['student_number'],
      }],
    }],
  });

  const rows = [];

  for (const enrollment of enrollments) {
    const student = enrollment.student;
    const studentNumber = student.studentProfile?.student_number || String(student.id);

    for (const asg of assignments) {
      // Find submission for this student + assignment
      const subWhere = { assignment_id: asg.id, user_id: student.id };
      if (dateFrom || dateTo) {
        subWhere.submitted_at = {};
        if (dateFrom) subWhere.submitted_at[Op.gte] = new Date(dateFrom);
        if (dateTo)   subWhere.submitted_at[Op.lte] = new Date(dateTo);
      }

      const submission = await Submission.findOne({ where: subWhere });

      rows.push({
        studentId:    studentNumber,
        studentName:  `${student.first_name} ${student.last_name}`,
        section:      asg.section?.title || 'N/A',
        assignment:   asg.title,
        submittedAt:  submission?.submitted_at
          ? new Date(submission.submitted_at).toLocaleDateString('sq-AL')
          : '—',
        grade:        submission?.grade ?? '—',
        hasSubmission: !!submission,
      });
    }
  }

  return rows;
};

// ─────────────────────────────────────────────
// PIE DATA FOR A COURSE (with optional section/assignment filter)
// ─────────────────────────────────────────────
const getCoursePieData = async (courseId, { sectionId, assignmentId, dateFrom, dateTo } = {}) => {
  const asgWhere = { course_id: courseId };
  if (sectionId)    asgWhere.section_id = sectionId;
  if (assignmentId) asgWhere.id         = assignmentId;

  const assignments   = await Assignment.findAll({ where: asgWhere, attributes: ['id'] });
  const assignmentIds = assignments.map(a => a.id);
  const totalStudents = await Enrollment.count({ where: { course_id: courseId } });

  if (!assignmentIds.length) {
    return { totalStudents, submitted: 0, notSubmitted: totalStudents };
  }

  const subWhere = { assignment_id: { [Op.in]: assignmentIds } };
  if (dateFrom || dateTo) {
    subWhere.submitted_at = {};
    if (dateFrom) subWhere.submitted_at[Op.gte] = new Date(dateFrom);
    if (dateTo)   subWhere.submitted_at[Op.lte] = new Date(dateTo);
  }

  const rows = await Submission.findAll({
    where:      subWhere,
    attributes: [[fn('COUNT', fn('DISTINCT', col('user_id'))), 'cnt']],
    raw:        true,
  });

  const submitted    = parseInt(rows[0]?.cnt || 0);
  const notSubmitted = Math.max(totalStudents - submitted, 0);

  return { totalStudents, submitted, notSubmitted };
};

// ─────────────────────────────────────────────
// PROFESSORS LIST (for filter dropdown)
// ─────────────────────────────────────────────
const getProfessorsForFilter = async () => {
  const profiles = await ProfessorProfile.findAll({
    include: [{
      model:      User,
      as:         'user',
      attributes: ['id', 'first_name', 'last_name'],
    }],
    attributes: ['id', 'user_id'],
  });

  return profiles.map(p => ({
    id:   p.user?.id,
    name: p.user ? `${p.user.first_name} ${p.user.last_name}` : 'N/A',
  }));
};

// ─────────────────────────────────────────────
// YEARS (enrollment_year distinct list for filter)
// ─────────────────────────────────────────────
const getEnrollmentYears = async () => {
  const StudentProfile = require('../models/sql/StudentProfile');
  const rows = await StudentProfile.findAll({
    attributes: [[fn('DISTINCT', col('enrollment_year')), 'enrollment_year']],
    order:      [[col('enrollment_year'), 'DESC']],
    raw:        true,
  });
  return rows.map(r => r.enrollment_year).filter(Boolean);
};

module.exports = {
  getGlobalSummary,
  getCoursesForReport,
  getCourseSubmissionTable,
  getCoursePieData,
  getProfessorsForFilter,
  getEnrollmentYears,
};
