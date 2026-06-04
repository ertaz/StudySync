const ExcelJS    = require('exceljs');
const { Parser } = require('json2csv');
const xlsx       = require('xlsx');

// ─────────────────────────────────────────────
// SEND EXPORT RESPONSE
// rows: array of plain objects
// format: 'csv' | 'excel' | 'json'
// filename: base filename without extension
// ─────────────────────────────────────────────
const sendExport = async (rows, format, filename, res) => {
  if (format === 'json') {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.setHeader('Content-Type', 'application/json');
    return res.json(rows);
  }

  if (format === 'csv') {
    if (!rows.length) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.send('');
    }
    const parser = new Parser({ fields: Object.keys(rows[0]) });
    const csv    = parser.parse(rows);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv);
  }

  if (format === 'excel') {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Data');

    if (rows.length > 0) {
      ws.addRow(Object.keys(rows[0]));
      rows.forEach(r => ws.addRow(Object.values(r)));
      ws.getRow(1).font      = { bold: true };
      ws.getRow(1).fill      = {
        type:    'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE1F5EE' },
      };
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await wb.xlsx.write(res);
    return res.end();
  }

  throw new Error(`Unsupported format: ${format}`);
};

// ─────────────────────────────────────────────
// PARSE IMPORT FILE → array of plain objects
// Supports CSV and Excel (.xlsx, .xls)
// ─────────────────────────────────────────────
const parseImportFile = (filePath, mimetype) => {
  const workbook  = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet     = workbook.Sheets[sheetName];
  const rows      = xlsx.utils.sheet_to_json(sheet, { defval: null });
  return rows;
};

module.exports = { sendExport, parseImportFile };
