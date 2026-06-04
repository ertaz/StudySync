const { sendExport, parseImportFile } = require('../utils/exportImportUtils');
const User             = require('../models/sql/User');
const ProfessorProfile = require('../models/sql/ProfessorProfile');
const bcrypt           = require('bcryptjs');

// ─────────────────────────────────────────────
// EXPORT PROFESSORS
// ─────────────────────────────────────────────
const exportProfessors = async (format, res) => {
  const profiles = await ProfessorProfile.findAll({
    include: [{
      model:      User,
      as:         'user',
      attributes: ['id', 'first_name', 'last_name', 'email', 'is_active', 'created_at'],
    }],
    order: [['created_at', 'DESC']],
  });

  const rows = profiles.map(p => ({
    id:                  p.user?.id,
    first_name:          p.user?.first_name,
    last_name:           p.user?.last_name,
    email:               p.user?.email,
    title:               p.title          || '',
    department:          p.department     || '',
    years_of_experience: p.years_of_experience || 0,
    phone_number:        p.phone_number   || '',
    is_active:           p.user?.is_active,
    created_at:          p.user?.created_at
      ? new Date(p.user.created_at).toISOString().split('T')[0]
      : '',
  }));

  await sendExport(rows, format, `professors_${Date.now()}`, res);
};

// ─────────────────────────────────────────────
// IMPORT PROFESSORS
// Expected columns: first_name, last_name, email, password (optional),
//                   title (optional), department (optional),
//                   years_of_experience (optional), phone_number (optional)
// ─────────────────────────────────────────────
const importProfessors = async (filePath, mimetype, createdBy) => {
  const rows    = parseImportFile(filePath, mimetype);
  const results = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row    = rows[i];
    const rowNum = i + 2;

    try {
      if (!row.first_name || !row.last_name || !row.email) {
        results.errors.push({ row: rowNum, message: 'Missing required fields: first_name, last_name, email' });
        results.skipped++;
        continue;
      }

      const existingUser = await User.findOne({ where: { email: row.email } });
      if (existingUser) {
        results.errors.push({ row: rowNum, message: `Email already exists: ${row.email}` });
        results.skipped++;
        continue;
      }

      const password_hash = await bcrypt.hash(row.password || 'Professor123!', 10);

      const user = await User.create({
        first_name:    String(row.first_name),
        last_name:     String(row.last_name),
        email:         String(row.email).toLowerCase().trim(),
        password_hash,
        is_active:     1,
        created_by:    createdBy,
        updated_by:    createdBy,
      });

      await ProfessorProfile.create({
        user_id:             user.id,
        title:               row.title               || null,
        department:          row.department          || null,
        years_of_experience: row.years_of_experience ? parseInt(row.years_of_experience) : 0,
        phone_number:        row.phone_number        || null,
        created_by:          createdBy,
        updated_by:          createdBy,
      });

      // Assign professor role
      const Role     = require('../models/sql/Role');
      const UserRole = require('../models/sql/UserRole');
      const profRole = await Role.findOne({ where: { name: 'professor' } });
      if (profRole) {
        await UserRole.create({ user_id: user.id, role_id: profRole.id });
      }

      results.imported++;
    } catch (err) {
      results.errors.push({ row: rowNum, message: err.message });
      results.skipped++;
    }
  }

  return results;
};

module.exports = { exportProfessors, importProfessors };
