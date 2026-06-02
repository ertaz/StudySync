const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const Assignment = require('../models/sql/Assignment');
const Course = require('../models/sql/Course');

const getAssignmentsForExport = async (filters = {}) => {
  const { Op } = require('sequelize');
  const where = {};

  if (filters.course_id) where.course_id = filters.course_id;

  if (filters.due_from || filters.due_to) {
    where.deadline = {};
    if (filters.due_from) where.deadline[Op.gte] = new Date(filters.due_from);
    if (filters.due_to)   where.deadline[Op.lte] = new Date(filters.due_to);
  }

  const assignments = await Assignment.findAll({
    where,
    include: [{ model: Course, as: 'course' }],
    order: [['created_at', 'DESC']]
  });

  return assignments.map((a) => ({
    id:          a.id,
    title:       a.title,
    description: a.description,
    course:      a.course ? a.course.name : '',
    course_id:   a.course_id,
    deadline:    a.deadline ? new Date(a.deadline).toISOString() : '',
    max_grade:   a.max_grade,
    created_at:  a.created_at ? new Date(a.created_at).toISOString() : ''
  }));
};

const exportToCSV = async (filters) => {
  const data = await getAssignmentsForExport(filters);
  const parser = new Parser();
  return parser.parse(data);
};

const exportToExcel = async (filters) => {
  const data = await getAssignmentsForExport(filters);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Assignments');

  sheet.columns = [
    { header: 'ID',          key: 'id',          width: 8 },
    { header: 'Title',       key: 'title',        width: 30 },
    { header: 'Description', key: 'description',  width: 40 },
    { header: 'Course',      key: 'course',       width: 20 },
    { header: 'Deadline',    key: 'deadline',     width: 25 },
    { header: 'Max Grade',   key: 'max_grade',    width: 12 },
    { header: 'Created At',  key: 'created_at',   width: 25 }
  ];

  sheet.getRow(1).font = { bold: true };

  data.forEach((row) => sheet.addRow(row));

  return workbook.xlsx.writeBuffer();
};

const exportToJSON = async (filters) => {
  const data = await getAssignmentsForExport(filters);
  return JSON.stringify(data, null, 2);
};

module.exports = {
  exportToCSV,
  exportToExcel,
  exportToJSON
};
