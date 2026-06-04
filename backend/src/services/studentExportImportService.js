const { sendExport, parseImportFile } = require('../utils/exportImportUtils');
const User           = require('../models/sql/User');
const StudentProfile = require('../models/sql/StudentProfile');
const bcrypt         = require('bcryptjs');
const { Op }         = require('sequelize');

// ─────────────────────────────────────────────
// EXPORT STUDENTS
// ─────────────────────────────────────────────
const exportStudents = async (format, res) => {
  const profiles = await StudentProfile.findAll({
    include: [{
      model:      User,
      as:         'user',
      attributes: ['id', 'first_name', 'last_name', 'email', 'is_active', 'created_at'],
    }],
    order: [['created_at', 'DESC']],
  });

  const rows = profiles.map(p => ({
    id:              p.user?.id,
    first_name:      p.user?.first_name,
    last_name:       p.user?.last_name,
    email:           p.user?.email,
    student_number:  p.student_number,
    major:           p.major,
    enrollment_year: p.enrollment_year,
    date_of_birth:   p.date_of_birth || '',
    phone_number:    p.phone_number  || '',
    is_active:       p.user?.is_active,
    created_at:      p.user?.created_at
      ? new Date(p.user.created_at).toISOString().split('T')[0]
      : '',
  }));

  await sendExport(rows, format, `students_${Date.now()}`, res);
};

// ─────────────────────────────────────────────
// IMPORT STUDENTS
// Expected columns: first_name, last_name, email, password,
//                   student_number, major, enrollment_year,
//                   date_of_birth (optional), phone_number (optional)
// ─────────────────────────────────────────────
const importStudents = async (filePath, mimetype, createdBy) => {
  const rows = parseImportFile(filePath, mimetype);

  const results = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header

    try {
      // Required field validation
      if (!row.first_name || !row.last_name || !row.email || !row.student_number || !row.major || !row.enrollment_year) {
        results.errors.push({ row: rowNum, message: 'Missing required fields (first_name, last_name, email, student_number, major, enrollment_year)' });
        results.skipped++;
        continue;
      }

      // Check duplicate email
      const existingUser = await User.findOne({ where: { email: row.email } });
      if (existingUser) {
        results.errors.push({ row: rowNum, message: `Email already exists: ${row.email}` });
        results.skipped++;
        continue;
      }

      // Check duplicate student_number
      const existingProfile = await StudentProfile.findOne({ where: { student_number: String(row.student_number) } });
      if (existingProfile) {
        results.errors.push({ row: rowNum, message: `Student number already exists: ${row.student_number}` });
        results.skipped++;
        continue;
      }

      const password_hash = await bcrypt.hash(row.password || 'Student123!', 10);

      const user = await User.create({
        first_name:    String(row.first_name),
        last_name:     String(row.last_name),
        email:         String(row.email).toLowerCase().trim(),
        password_hash,
        is_active:     1,
        created_by:    createdBy,
        updated_by:    createdBy,
      });

      await StudentProfile.create({
        user_id:         user.id,
        student_number:  String(row.student_number),
        major:           String(row.major),
        enrollment_year: parseInt(row.enrollment_year),
        date_of_birth:   row.date_of_birth || null,
        phone_number:    row.phone_number  || null,
        created_by:      createdBy,
        updated_by:      createdBy,
      });

      // Assign student role
      const Role    = require('../models/sql/Role');
      const UserRole = require('../models/sql/UserRole');
      const studentRole = await Role.findOne({ where: { name: 'student' } });
      if (studentRole) {
        await UserRole.create({ user_id: user.id, role_id: studentRole.id });
      }

      results.imported++;
    } catch (err) {
      results.errors.push({ row: rowNum, message: err.message });
      results.skipped++;
    }
  }

  return results;
};

module.exports = { exportStudents, importStudents };
