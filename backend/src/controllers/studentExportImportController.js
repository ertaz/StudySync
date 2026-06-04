const service = require('../services/studentExportImportService');

// GET /api/students/export?format=csv|excel|json
const exportStudents = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    await service.exportStudents(format, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/students/import  (multipart: file)
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const results = await service.importStudents(
      req.file.path,
      req.file.mimetype,
      req.user.id
    );
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { exportStudents, importStudents };
