const service = require('../services/professorExportImportService');

// GET /api/professors/export?format=csv|excel|json
const exportProfessors = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    await service.exportProfessors(format, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/professors/import  (multipart: file)
const importProfessors = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const results = await service.importProfessors(
      req.file.path,
      req.file.mimetype,
      req.user.id
    );
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { exportProfessors, importProfessors };
