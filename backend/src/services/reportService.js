const repo       = require('../repositories/reportRepository');
const ExcelJS    = require('exceljs');
const { Parser } = require('json2csv');

// ─────────────────────────────────────────────
// GET FILTER OPTIONS (professors + years)
// ─────────────────────────────────────────────
const getFilterOptions = async () => {
  const [professors, years] = await Promise.all([
    repo.getProfessorsForFilter(),
    repo.getEnrollmentYears(),
  ]);
  return { professors, years };
};

// ─────────────────────────────────────────────
// GET FULL REPORT DATA
// ─────────────────────────────────────────────
const getReportData = async (filters = {}) => {
  const { professorId, courseId, dateFrom, dateTo } = filters;

  const [summary, courses] = await Promise.all([
    repo.getGlobalSummary({ professorId, courseId, dateFrom, dateTo }),
    repo.getCoursesForReport({ professorId, courseId, dateFrom, dateTo }),
  ]);

  return { summary, courses };
};

// ─────────────────────────────────────────────
// GET COURSE DETAIL (pie + table)
// ─────────────────────────────────────────────
const getCourseDetail = async (courseId, filters = {}) => {
  const { sectionId, assignmentId, dateFrom, dateTo } = filters;

  const [pieData, tableRows] = await Promise.all([
    repo.getCoursePieData(courseId, { sectionId, assignmentId, dateFrom, dateTo }),
    repo.getCourseSubmissionTable(courseId, { sectionId, assignmentId, dateFrom, dateTo }),
  ]);

  return { pieData, tableRows };
};

// ─────────────────────────────────────────────
// EXPORT FULL REPORT
// format: 'csv' | 'excel' | 'json'
// ─────────────────────────────────────────────
const exportFullReport = async (filters, format, res) => {
  const { summary, courses } = await getReportData(filters);

  // Flatten: one row per course for the summary table
  const rows = courses.map(c => ({
    'Course':             c.title,
    'Professor':          c.professor,
    'Category':           c.category,
    'Enrolled students':  c.studentCount,
    'Total assignments':  c.totalAssignments,
    'With submission':    c.withSubmission,
    'Without submission': c.withoutSubmission,
    'Submission rate (%)': c.totalAssignments > 0
      ? Math.round((c.withSubmission / c.totalAssignments) * 100)
      : 0,
  }));

  const filename = `report_${Date.now()}`;

  if (format === 'json') {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.setHeader('Content-Type', 'application/json');
    return res.json({ summary, courses: rows });
  }

  if (format === 'csv') {
    const parser = new Parser();
    const csv    = parser.parse(rows);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv);
  }

  if (format === 'excel') {
    const wb = new ExcelJS.Workbook();

    // Sheet 1 — Summary
    const ws1 = wb.addWorksheet('Summary');
    ws1.addRow(['Metric', 'Value']);
    ws1.addRow(['Total students',       summary.totalStudents]);
    ws1.addRow(['Active courses',        summary.activeCourses]);
    ws1.addRow(['Submission rate (%)',   summary.submissionRate]);
    ws1.addRow(['Unsubmitted assignments', summary.unsubmittedCount]);
    ws1.getRow(1).font = { bold: true };

    // Sheet 2 — Courses
    const ws2 = wb.addWorksheet('Courses');
    if (rows.length > 0) {
      ws2.addRow(Object.keys(rows[0]));
      rows.forEach(r => ws2.addRow(Object.values(r)));
      ws2.getRow(1).font = { bold: true };
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await wb.xlsx.write(res);
    return res.end();
  }

  throw new Error('Unsupported format');
};

// ─────────────────────────────────────────────
// EXPORT COURSE SUBMISSION TABLE
// format: 'csv' | 'excel' | 'json'
// ─────────────────────────────────────────────
const exportCourseTable = async (courseId, filters, format, res) => {
  const { tableRows } = await getCourseDetail(courseId, filters);

  const rows = tableRows.map(r => ({
    'Student ID':    r.studentId,
    'Student name':  r.studentName,
    'Section':       r.section,
    'Assignment':    r.assignment,
    'Submitted at':  r.submittedAt,
    'Grade':         r.grade,
  }));

  const filename = `course_${courseId}_submissions_${Date.now()}`;

  if (format === 'json') {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.setHeader('Content-Type', 'application/json');
    return res.json(rows);
  }

  if (format === 'csv') {
    if (!rows.length) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.send('Student ID,Student name,Section,Assignment,Submitted at,Grade\n');
    }
    const parser = new Parser();
    const csv    = parser.parse(rows);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv);
  }

  if (format === 'excel') {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Submissions');

    if (rows.length > 0) {
      ws.addRow(Object.keys(rows[0]));
      rows.forEach(r => ws.addRow(Object.values(r)));
      ws.getRow(1).font = { bold: true };
      // Color submitted/not-submitted rows
      ws.eachRow((row, idx) => {
        if (idx === 1) return;
        const gradeCell = row.getCell(6);
        if (gradeCell.value === '—') {
          row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCEBEB' } }; });
        }
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await wb.xlsx.write(res);
    return res.end();
  }

  throw new Error('Unsupported format');
};

// ─────────────────────────────────────────────
// CHECK IF COURSE BELONGS TO PROFESSOR
// ─────────────────────────────────────────────
const coursebelongsToProfessor = async (courseId, professorId) => {
  return repo.coursebelongsToProfessor(courseId, professorId);
};

module.exports = {
  getFilterOptions,
  getReportData,
  getCourseDetail,
  exportFullReport,
  exportCourseTable,
  coursebelongsToProfessor,
};