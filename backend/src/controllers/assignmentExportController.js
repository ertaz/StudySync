const exportService = require('../services/assignmentExportService');

const exportAssignments = async (req, res) => {
  try {
    const format = req.query.format || 'csv';

    const filters = {
      course_id: req.query.course_id,
      due_from:  req.query.due_from,
      due_to:    req.query.due_to
    };

    if (format === 'excel') {
      const buffer = await exportService.exportToExcel(filters);

      res.setHeader('Content-Disposition', 'attachment; filename="assignments.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      return res.send(buffer);
    }

    if (format === 'json') {
      const json = await exportService.exportToJSON(filters);

      res.setHeader('Content-Disposition', 'attachment; filename="assignments.json"');
      res.setHeader('Content-Type', 'application/json');

      return res.send(json);
    }

    // default: csv
    const csv = await exportService.exportToCSV(filters);

    res.setHeader('Content-Disposition', 'attachment; filename="assignments.csv"');
    res.setHeader('Content-Type', 'text/csv');

    return res.send(csv);

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { exportAssignments };
