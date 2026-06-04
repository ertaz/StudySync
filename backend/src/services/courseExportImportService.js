const { sendExport, parseImportFile } = require('../utils/exportImportUtils');
const Course    = require('../models/sql/Course');
const Category  = require('../models/sql/Category');
const User      = require('../models/sql/User');

// ─────────────────────────────────────────────
// EXPORT COURSES
// ─────────────────────────────────────────────
const exportCourses = async (format, res) => {
  const courses = await Course.findAll({
    include: [
      { model: Category, as: 'category',  attributes: ['id', 'name'] },
      { model: User,     as: 'professor', attributes: ['id', 'first_name', 'last_name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
  });

  const rows = courses.map(c => ({
    id:             c.id,
    title:          c.title,
    description:    c.description || '',
    category_id:    c.category_id || '',
    category_name:  c.category?.name || '',
    professor_id:   c.professor_id || '',
    professor_name: c.professor
      ? `${c.professor.first_name} ${c.professor.last_name}`
      : '',
    professor_email: c.professor?.email || '',
    created_at:     c.created_at
      ? new Date(c.created_at).toISOString().split('T')[0]
      : '',
  }));

  await sendExport(rows, format, `courses_${Date.now()}`, res);
};

// ─────────────────────────────────────────────
// IMPORT COURSES
// Expected columns: title, description (optional),
//                   category_id OR category_name,
//                   professor_id OR professor_email
// ─────────────────────────────────────────────
const importCourses = async (filePath, mimetype, createdBy) => {
  const rows    = parseImportFile(filePath, mimetype);
  const results = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row    = rows[i];
    const rowNum = i + 2;

    try {
      if (!row.title) {
        results.errors.push({ row: rowNum, message: 'Missing required field: title' });
        results.skipped++;
        continue;
      }

      // Resolve category
      let category_id = row.category_id ? parseInt(row.category_id) : null;
      if (!category_id && row.category_name) {
        const cat = await Category.findOne({ where: { name: row.category_name } });
        if (cat) category_id = cat.id;
      }

      // Resolve professor
      let professor_id = row.professor_id ? parseInt(row.professor_id) : null;
      if (!professor_id && row.professor_email) {
        const prof = await User.findOne({ where: { email: row.professor_email } });
        if (prof) professor_id = prof.id;
      }

      await Course.create({
        title:        String(row.title),
        description:  row.description || null,
        category_id:  category_id,
        professor_id: professor_id,
        created_by:   createdBy,
        updated_by:   createdBy,
      });

      results.imported++;
    } catch (err) {
      results.errors.push({ row: rowNum, message: err.message });
      results.skipped++;
    }
  }

  return results;
};

module.exports = { exportCourses, importCourses };
