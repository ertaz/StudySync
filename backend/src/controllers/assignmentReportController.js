const reportService = require('../services/assignmentReportService');
const exportService = require('../services/assignmentExportService');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const getReport = async (req, res) => {
  try {
    const filters = {
      course_id:  req.query.course_id,
      date_from:  req.query.date_from,
      date_to:    req.query.date_to
    };

    const data = await reportService.generateReport(filters);
    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const exportReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';

    const filters = {
      course_id:  req.query.course_id,
      date_from:  req.query.date_from,
      date_to:    req.query.date_to
    };

    const report = await reportService.generateReport(filters);

    if (format === 'csv') {
      const { Parser } = require('json2csv');
      const flat = [
        {
          assignments_created:   report.assignments_created,
          assignments_submitted: report.assignments_submitted,
          total_submissions:     report.total_submissions,
          late_submissions:      report.late_submissions,
          overdue_assignments:   report.overdue_assignments,
          completion_rate:       report.completion_rate
        }
      ];
      const parser = new Parser();
      const csv = parser.parse(flat);

      res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Report');

      sheet.columns = [
        { header: 'Metric',  key: 'metric',  width: 30 },
        { header: 'Value',   key: 'value',   width: 20 }
      ];

      sheet.getRow(1).font = { bold: true };

      const rows = [
        { metric: 'Assignments Created',   value: report.assignments_created },
        { metric: 'Assignments Submitted', value: report.assignments_submitted },
        { metric: 'Total Submissions',     value: report.total_submissions },
        { metric: 'Late Submissions',      value: report.late_submissions },
        { metric: 'Overdue Assignments',   value: report.overdue_assignments },
        { metric: 'Completion Rate',       value: report.completion_rate }
      ];

      rows.forEach((r) => sheet.addRow(r));

      if (report.by_course) {
        sheet.addRow({});
        sheet.addRow({ metric: '--- By Course ---', value: '' });
        Object.entries(report.by_course).forEach(([course, stats]) => {
          sheet.addRow({ metric: course, value: `${stats.submitted}/${stats.total}` });
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }

    // default: PDF
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => {
      const pdf = Buffer.concat(buffers);
      res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdf);
    });

    doc.fontSize(18).font('Helvetica-Bold').text('Assignment Report', { align: 'center' });
    doc.moveDown();

    if (filters.date_from || filters.date_to) {
      doc.fontSize(11).font('Helvetica').text(
        `Period: ${filters.date_from || '—'}  →  ${filters.date_to || '—'}`,
        { align: 'center' }
      );
      doc.moveDown();
    }

    doc.fontSize(12).font('Helvetica-Bold').text('Summary');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11);

    const lines = [
      ['Assignments Created',   report.assignments_created],
      ['Assignments Submitted', report.assignments_submitted],
      ['Total Submissions',     report.total_submissions],
      ['Late Submissions',      report.late_submissions],
      ['Overdue Assignments',   report.overdue_assignments],
      ['Completion Rate',       report.completion_rate]
    ];

    lines.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
    });

    if (report.by_course && Object.keys(report.by_course).length > 0) {
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(12).text('By Course');
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(11);

      Object.entries(report.by_course).forEach(([course, stats]) => {
        doc.text(`${course}: ${stats.submitted}/${stats.total} submitted`);
      });
    }

    doc.end();

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getReport, exportReport };
