const service = require('../services/categoryExportImportService');

// GET /api/categories/export?format=csv|excel|json
const exportCategories = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    await service.exportCategories(format, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/categories/import  (multipart: file)
const importCategories = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const results = await service.importCategories(
      req.file.path,
      req.file.mimetype,
      req.user.id
    );
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { exportCategories, importCategories };
