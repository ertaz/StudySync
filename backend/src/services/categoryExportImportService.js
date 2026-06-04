const { sendExport, parseImportFile } = require('../utils/exportImportUtils');
const Category = require('../models/sql/Category');

// ─────────────────────────────────────────────
// EXPORT CATEGORIES
// ─────────────────────────────────────────────
const exportCategories = async (format, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });

  const rows = categories.map(c => ({
    id:          c.id,
    name:        c.name,
    description: c.description || '',
    created_at:  c.created_at
      ? new Date(c.created_at).toISOString().split('T')[0]
      : '',
  }));

  await sendExport(rows, format, `categories_${Date.now()}`, res);
};

// ─────────────────────────────────────────────
// IMPORT CATEGORIES
// Expected columns: name, description (optional)
// ─────────────────────────────────────────────
const importCategories = async (filePath, mimetype, createdBy) => {
  const rows    = parseImportFile(filePath, mimetype);
  const results = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row    = rows[i];
    const rowNum = i + 2;

    try {
      if (!row.name) {
        results.errors.push({ row: rowNum, message: 'Missing required field: name' });
        results.skipped++;
        continue;
      }

      const existing = await Category.findOne({
        where: { name: String(row.name).trim() },
      });

      if (existing) {
        results.errors.push({ row: rowNum, message: `Category already exists: ${row.name}` });
        results.skipped++;
        continue;
      }

      await Category.create({
        name:        String(row.name).trim(),
        description: row.description || null,
        created_by:  createdBy,
        updated_by:  createdBy,
      });

      results.imported++;
    } catch (err) {
      results.errors.push({ row: rowNum, message: err.message });
      results.skipped++;
    }
  }

  return results;
};

module.exports = { exportCategories, importCategories };
