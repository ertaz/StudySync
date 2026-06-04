const service = require('../services/enrollmentExportImportService');

// GET /api/enrollments/export?format=csv|excel|json
const exportEnrollments = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    await service.exportEnrollments(format, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/enrollments/import  (multipart: file)
const importEnrollments = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const results = await service.importEnrollments(
      req.file.path,
      req.file.mimetype,
      req.user.id
    );
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { exportEnrollments, importEnrollments };
