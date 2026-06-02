const Lesson = require('../models/sql/Lesson');

const create = (data) => Lesson.create(data);

const update = (id, data) =>
  Lesson.update(data, { where: { id } });

const remove = (id) =>
  Lesson.destroy({ where: { id } });

module.exports = { create, update, remove };