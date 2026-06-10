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

  // FIX: Unique enrolled students — only users with role='student'
  const enrollmentRows = await Enrollment.findAll({
    where: { course_id: { [Op.in]: courseIds } },
    include: [{
      model:      User,
      as:         'student',
      attributes: [],
      where:      { is_active: 1 },
      required:   true,
      include: [{
        model:    StudentProfile,
        as:       'studentProfile',
        attributes: [],
        required: true,
      }],
    }],
    attributes: [[fn('COUNT', fn('DISTINCT', col('Enrollment.user_id'))), 'cnt']],
    raw: true,
  });
  const totalStudents = parseInt(enrollmentRows[0]?.cnt || 0);

  // Assignments in date range — FIX: only assignments WITH a section_id
  const assignmentWhere = {
    course_id:  { [Op.in]: courseIds },
    section_id: { [Op.ne]: null },        // FIX: exclude orphan assignments
  };
  if (dateFrom || dateTo) {
    assignmentWhere.created_at = {};
    if (dateFrom) assignmentWhere.created_at[Op.gte] = new Date(dateFrom);
    if (dateTo)   assignmentWhere.created_at[Op.lte] = new Date(dateTo);
  }

  const assignments = await Assignment.findAll({
    where:      assignmentWhere,
    attributes: ['id'],
  });
  const assignmentIds    = assignments.map(a => a.id);
  const totalAssignments = assignmentIds.length;

  // FIX: submission rate = (student×assignment pairs that have a submission) / (total student×assignment pairs)
  // Total pairs = enrolled students per course × assignments per course (scoped)
  let submittedPairs = 0;
  let totalPairs     = 0;

  if (totalAssignments > 0) {
    // Count total student×assignment pairs
    for (const cId of courseIds) {
      const studentCount = await Enrollment.count({
        where: { course_id: cId },
        include: [{
          model:    User,
          as:       'student',
          attributes: [],
          required: true,
          include: [{
            model:    StudentProfile,
            as:       'studentProfile',
            attributes: [],
            required: true,
          }],
        }],
      });

      const courseAsgIds = assignmentIds; // already scoped to courseIds
      // only assignments belonging to this specific course
      const courseAssignments = await Assignment.findAll({
        where: { id: { [Op.in]: assignmentIds }, course_id: cId },
        attributes: ['id'],
      });

      totalPairs += studentCount * courseAssignments.length;
    }

    // Count actual submission pairs
    const subRows = await Submission.findAll({
      where:      { assignment_id: { [Op.in]: assignmentIds } },
      attributes: [[fn('COUNT', col('id')), 'cnt']],
      raw:        true,
    });
    submittedPairs = parseInt(subRows[0]?.cnt || 0);
  }

  const submissionRate   = totalPairs > 0
    ? Math.round((submittedPairs / totalPairs) * 100)
    : 0;
  const unsubmittedCount = Math.max(totalPairs - submittedPairs, 0);

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
        model:      CourseSection,
        as:         'sections',
        attributes: ['id', 'title'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  const result = await Promise.all(courses.map(async (course) => {
    // FIX: count only real students (those with a StudentProfile)
    const studentCount = await Enrollment.count({
      where: { course_id: course.id },
      include: [{
        model:    User,
        as:       'student',
        attributes: [],
        required: true,
        include: [{
          model:    StudentProfile,
          as:       'studentProfile',
          attributes: [],
          required: true,
        }],
      }],
    });

    // FIX: only assignments WITH a section_id
    const asgWhere = {
      course_id:  course.id,
      section_id: { [Op.ne]: null },
    };
    if (dateFrom || dateTo) {
      asgWhere.created_at = {};
      if (dateFrom) asgWhere.created_at[Op.gte] = new Date(dateFrom);
      if (dateTo)   asgWhere.created_at[Op.lte] = new Date(dateTo);
    }

    const assignments = await Assignment.findAll({
      where:      asgWhere,
      attributes: ['id'],
    });
    const assignmentIds    = assignments.map(a => a.id);
    const totalAssignments = assignmentIds.length;

    // FIX: with/withoutSubmission based on student×assignment pairs
    let withSubmission    = 0;
    let withoutSubmission = 0;

    if (totalAssignments > 0) {
      const rows = await Submission.findAll({
        where:      { assignment_id: { [Op.in]: assignmentIds } },
        attributes: [[fn('COUNT', col('id')), 'cnt']],
        raw:        true,
      });
      withSubmission    = parseInt(rows[0]?.cnt || 0);
      withoutSubmission = Math.max(studentCount * totalAssignments - withSubmission, 0);
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
  // FIX: when no sectionId filter, still require section_id IS NOT NULL
  const asgWhere = {
    course_id:  courseId,
    section_id: sectionId ? sectionId : { [Op.ne]: null },
  };
  if (assignmentId) asgWhere.id = assignmentId;

  const assignments = await Assignment.findAll({
    where:   asgWhere,
    include: [{ model: CourseSection, as: 'section', attributes: ['id', 'title'] }],
    attributes: ['id', 'title'],
  });

  if (!assignments.length) return [];

  const assignmentIds = assignments.map(a => a.id);
  const asgMap        = {};
  assignments.forEach(a => { asgMap[a.id] = a; });

  // FIX: only enrolled users that have a StudentProfile (real students, not admins)
  const enrollments = await Enrollment.findAll({
    where: { course_id: courseId },
    include: [{
      model:   User,
      as:      'student',
      attributes: ['id', 'first_name', 'last_name'],
      required: true,
      include: [{
        model:      StudentProfile,
        as:         'studentProfile',
        attributes: ['student_number'],
        required:   true,               // FIX: INNER JOIN — excludes non-students
      }],
    }],
  });

  const rows = [];

  for (const enrollment of enrollments) {
    const student       = enrollment.student;
    const studentNumber = student.studentProfile?.student_number || String(student.id);

    for (const asg of assignments) {
      // Find submission for this student + assignment
      const subWhere = { assignment_id: asg.id, user_id: student.id };
      if (dateFrom || dateTo) {
        subWhere.submitted_at = {};
        if (dateFrom) subWhere.submitted_at[Op.gte] = new Date(dateFrom);
        if (dateTo)   subWhere.submitted_at[Op.lte] = new Date(dateTo);
      }

      // FIX: findOne is correct — one row per student×assignment (no duplicates)
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
  // FIX: same section_id guard as submission table
  const asgWhere = {
    course_id:  courseId,
    section_id: sectionId ? sectionId : { [Op.ne]: null },
  };
  if (assignmentId) asgWhere.id = assignmentId;

  const assignments   = await Assignment.findAll({ where: asgWhere, attributes: ['id'] });
  const assignmentIds = assignments.map(a => a.id);

  // FIX: count only real students
  const totalStudents = await Enrollment.count({
    where: { course_id: courseId },
    include: [{
      model:    User,
      as:       'student',
      attributes: [],
      required: true,
      include: [{
        model:    StudentProfile,
        as:       'studentProfile',
        attributes: [],
        required: true,
      }],
    }],
  });

  if (!assignmentIds.length) {
    return { totalStudents, submitted: 0, notSubmitted: totalStudents };
  }

  const subWhere = { assignment_id: { [Op.in]: assignmentIds } };
  if (dateFrom || dateTo) {
    subWhere.submitted_at = {};
    if (dateFrom) subWhere.submitted_at[Op.gte] = new Date(dateFrom);
    if (dateTo)   subWhere.submitted_at[Op.lte] = new Date(dateTo);
  }

  // FIX: pie tregon studentë unikë që kanë dorëzuar të paktën një assignment
  // (kjo është interpretimi më i saktë vizual për pie chart)
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
// REPLACE getProfessorsForFilter in reportRepository.js with this:

const getProfessorsForFilter = async () => {
  // FIX: return only professors that have at least one course assigned to them
  const courseProfessorIds = await Course.findAll({
    attributes: [[fn('DISTINCT', col('professor_id')), 'professor_id']],
    where:      { professor_id: { [Op.ne]: null } },
    raw:        true,
  });
  const professorUserIds = courseProfessorIds.map(r => r.professor_id).filter(Boolean);

  if (!professorUserIds.length) return [];

  const users = await User.findAll({
    where:      { id: { [Op.in]: professorUserIds } },
    attributes: ['id', 'first_name', 'last_name'],
    order:      [['first_name', 'ASC']],
  });

  return users.map(u => ({
    id:   u.id,
    name: `${u.first_name} ${u.last_name}`,
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

// ─────────────────────────────────────────────
// CHECK IF COURSE BELONGS TO PROFESSOR
// ─────────────────────────────────────────────
const coursebelongsToProfessor = async (courseId, professorId) => {
  const course = await Course.findOne({
    where: { id: courseId, professor_id: professorId },
    attributes: ['id'],
  });
  return !!course;
};

module.exports = {
  getGlobalSummary,
  getCoursesForReport,
  getCourseSubmissionTable,
  getCoursePieData,
  getProfessorsForFilter,
  getEnrollmentYears,
  coursebelongsToProfessor,
};