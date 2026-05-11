// src/repositories/courseRepository.js
const Course   = require('../models/sql/Course');
const Category = require('../models/sql/Category');
const File     = require('../models/sql/File');

const getAll = () =>
  Course.findAll({
    include: [
      { model: Category, as: 'category',  attributes: ['id', 'name'] },
      { model: File,     as: 'thumbnail', attributes: ['id', 'file_path', 'filename'] },
    ],
    order: [['created_at', 'DESC']],
  });

const findById = (id) =>
  Course.findByPk(id, {
    include: [
      { model: Category, as: 'category',  attributes: ['id', 'name'] },
      { model: File,     as: 'thumbnail', attributes: ['id', 'file_path', 'filename'] },
    ],
  });

const create  = (data)      => Course.create(data);
const update  = (id, data)  => Course.update(data, { where: { id } });
const destroy = (id)        => Course.destroy({ where: { id } });

module.exports = { getAll, findById, create, update, destroy };
