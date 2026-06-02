const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const Assignment = require('../models/sql/Assignment');

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

const importFromCSV = async (filePath, userId) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(Boolean);

  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx]; });

    if (!row.title || !row.course_id) continue;

    rows.push({
      title:       row.title,
      description: row.description || null,
      course_id:   Number(row.course_id),
      deadline:    row.deadline ? new Date(row.deadline) : null,
      max_grade:   row.max_grade ? Number(row.max_grade) : 100,
      created_by:  userId
    });
  }

  const created = await Promise.all(rows.map((r) => Assignment.create(r)));
  return created;
};

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
