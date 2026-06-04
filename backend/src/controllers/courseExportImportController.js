const service = require('../services/courseExportImportService');

// GET /api/courses/export?format=csv|excel|json
const exportCourses = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    await service.exportCourses(format, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/courses/import  (multipart: file)
const importCourses = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const results = await service.importCourses(
      req.file.path,
      req.file.mimetype,
      req.user.id
    );
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { exportCourses, importCourses };
