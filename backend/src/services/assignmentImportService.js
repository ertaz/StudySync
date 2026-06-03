// ─────────────────────────────────────────────
// FIX #8 — CSV parsing i brishtë
// Zëvendësojmë split(',') manual me librari
// csv-parse që trajton: presje brenda quotes,
// newlines brenda fushave, CRLF, BOM markers.
//
// Instalo: npm install csv-parse
// ─────────────────────────────────────────────

const ExcelJS = require('exceljs');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
const Assignment = require('../models/sql/Assignment');

// ─────────────────────────────────────────────
// IMPORT NGA EXCEL (.xlsx / .xls)
// (pa ndryshim — ExcelJS funksionon mirë)
// ─────────────────────────────────────────────
const importFromExcel = async (filePath, userId) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  const rows = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const title       = row.getCell(1).value;
    const description = row.getCell(2).value;
    const course_id   = row.getCell(3).value;
    const deadline    = row.getCell(4).value;
    const max_grade   = row.getCell(5).value;

    if (!title || !course_id) return;

    rows.push({
      title:       String(title),
      description: description ? String(description) : null,
      course_id:   Number(course_id),
      deadline:    deadline ? new Date(deadline) : null,
      max_grade:   max_grade ? Number(max_grade) : 100,
      created_by:  userId
    });
  });

  const created = await Promise.all(rows.map((r) => Assignment.create(r)));
  return created;
};

// ─────────────────────────────────────────────
// IMPORT NGA CSV — FIX #8
// Përdor csv-parse/sync për parsing të saktë:
//   - Fushë me presje: "Title, with comma" ✓
//   - Newline brenda fushës: "Line1\nLine2" ✓
//   - CRLF (\r\n) ✓
//   - BOM marker (UTF-8 me BOM) ✓
//   - Quote i dyfishtë escaped "" ✓
// ─────────────────────────────────────────────
const importFromCSV = async (filePath, userId) => {
  // Lexo si buffer për të mbështetur BOM
  const content = fs.readFileSync(filePath);

  let records;
  try {
    records = parse(content, {
      columns:          true,   // rreshti i parë = headers
      skip_empty_lines: true,
      trim:             true,
      bom:              true,   // heq BOM nëse ekziston
      relax_quotes:     true    // tolerant ndaj quotes të çrregullta
    });
  } catch (err) {
    throw new Error(`CSV parsing failed: ${err.message}`);
  }

  if (!records || records.length === 0) {
    throw new Error('CSV file is empty or has no data rows');
  }

  const rows = [];

  for (const record of records) {
    const title     = record.title     || record.Title;
    const course_id = record.course_id || record.course_id;

    // Kalo rreshtat pa title ose course_id
    if (!title || !course_id) continue;

    // Valido course_id të jetë numër
    const parsedCourseId = Number(course_id);
    if (isNaN(parsedCourseId)) continue;

    // Valido deadline nëse ekziston
    let deadline = null;
    if (record.deadline) {
      deadline = new Date(record.deadline);
      if (isNaN(deadline.getTime())) {
        deadline = null; // data e pavlefshme — injorohet
      }
    }

    const parsedMaxGrade = record.max_grade ? Number(record.max_grade) : 100;

    rows.push({
      title:       String(title).trim(),
      description: record.description ? String(record.description).trim() : null,
      course_id:   parsedCourseId,
      deadline,
      max_grade:   isNaN(parsedMaxGrade) ? 100 : parsedMaxGrade,
      created_by:  userId
    });
  }

  if (rows.length === 0) {
    throw new Error('No valid rows found in CSV. Check that title and course_id columns exist.');
  }

  const created = await Promise.all(rows.map((r) => Assignment.create(r)));
  return created;
};

// ─────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────
const importAssignments = async (file, userId) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === '.xlsx' || ext === '.xls') {
    return importFromExcel(file.path, userId);
  }

  if (ext === '.csv') {
    return importFromCSV(file.path, userId);
  }

  throw new Error('Unsupported file format. Use .xlsx or .csv');
};

module.exports = { importAssignments };
