const importService = require('../services/assignmentImportService');

const importAssignments = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const created = await importService.importAssignments(req.file, req.user.id);

    res.status(201).json({
      success: true,
      message: `${created.length} assignments imported successfully`,
      data: created
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { importAssignments };
