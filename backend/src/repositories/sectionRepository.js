const CourseSection = require('../models/sql/CourseSection');
const CourseSection = require('../models/sql/CourseSection');

const create = (data) => CourseSection.create(data);

const update = (id, data) =>
  CourseSection.update(data, { where: { id } });

const remove = (id) =>
  CourseSection.destroy({ where: { id } });

module.exports = { create, update, remove };