const { sendExport, parseImportFile } = require('../utils/exportImportUtils');
const Enrollment     = require('../models/sql/Enrollment');
const Course         = require('../models/sql/Course');
const User           = require('../models/sql/User');
const StudentProfile = require('../models/sql/StudentProfile');
const Category       = require('../models/sql/Category');

// ─────────────────────────────────────────────
// EXPORT ENROLLMENTS
// ─────────────────────────────────────────────
const exportEnrollments = async (format, res) => {
  const enrollments = await Enrollment.findAll({
    include: [
      {
        model:      User,
        as:         'student',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        include: [{
          model:      StudentProfile,
          as:         'studentProfile',
          attributes: ['student_number', 'enrollment_year'],
        }],
      },
      {
        model:      Course,
        as:         'course',
        attributes: ['id', 'title'],
        include: [{
          model:      Category,
          as:         'category',
          attributes: ['name'],
        }],
      },
    ],
    order: [['enrolled_at', 'DESC']],
  });

  const rows = enrollments.map(e => ({
    enrollment_id:   e.id,
    student_id:      e.student?.id,
    student_number:  e.student?.studentProfile?.student_number || '',
    student_name:    e.student
      ? `${e.student.first_name} ${e.student.last_name}`
      : '',
    student_email:   e.student?.email || '',
    course_id:       e.course?.id,
    course_title:    e.course?.title || '',
    category:        e.course?.category?.name || '',
    enrollment_year: e.student?.studentProfile?.enrollment_year || '',
    enrolled_at:     e.enrolled_at
      ? new Date(e.enrolled_at).toISOString().split('T')[0]
      : '',
  }));

  await sendExport(rows, format, `enrollments_${Date.now()}`, res);
};

// ─────────────────────────────────────────────
// IMPORT ENROLLMENTS
// Expected columns: user_id OR student_email OR student_number,
//                   course_id OR course_title
// ─────────────────────────────────────────────
const importEnrollments = async (filePath, mimetype, createdBy) => {
  const rows    = parseImportFile(filePath, mimetype);
  const results = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row    = rows[i];
    const rowNum = i + 2;

    try {
      // Resolve student
      let user_id = row.user_id ? parseInt(row.user_id) : null;

      if (!user_id && row.student_email) {
        const u = await User.findOne({ where: { email: row.student_email } });
        if (u) user_id = u.id;
      }

      if (!user_id && row.student_number) {
        const sp = await StudentProfile.findOne({ where: { student_number: String(row.student_number) } });
        if (sp) user_id = sp.user_id;
      }

      if (!user_id) {
        results.errors.push({ row: rowNum, message: 'Student not found. Provide user_id, student_email, or student_number.' });
        results.skipped++;
        continue;
      }

      // Resolve course
      let course_id = row.course_id ? parseInt(row.course_id) : null;

      if (!course_id && row.course_title) {
        const c = await Course.findOne({ where: { title: row.course_title } });
        if (c) course_id = c.id;
      }

      if (!course_id) {
        results.errors.push({ row: rowNum, message: 'Course not found. Provide course_id or course_title.' });
        results.skipped++;
        continue;
      }

      // Check duplicate
      const existing = await Enrollment.findOne({ where: { user_id, course_id } });
      if (existing) {
        results.errors.push({ row: rowNum, message: `Already enrolled: user_id=${user_id}, course_id=${course_id}` });
        results.skipped++;
        continue;
      }

      await Enrollment.create({
        user_id,
        course_id,
        enrolled_at: row.enrolled_at ? new Date(row.enrolled_at) : new Date(),
        created_by:  createdBy,
        updated_by:  null,
      });

      results.imported++;
    } catch (err) {
      results.errors.push({ row: rowNum, message: err.message });
      results.skipped++;
    }
  }

  return results;
};

module.exports = { exportEnrollments, importEnrollments };
