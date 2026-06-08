const Course    = require('../models/sql/Course');
const Category  = require('../models/sql/Category');
const File      = require('../models/sql/File');
const User      = require('../models/sql/User');

const getAll = () =>
  Course.findAll({
    include: [
      { model: Category, as: 'category',  attributes: ['id', 'name'] },
      { model: File,     as: 'thumbnail', attributes: ['id', 'file_path', 'filename'] },
      { model: User,     as: 'professor', attributes: ['id', 'first_name', 'last_name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
  });

const findById = (id) =>
  Course.findByPk(id, {
    include: [
      { model: Category, as: 'category',  attributes: ['id', 'name'] },
      { model: File,     as: 'thumbnail', attributes: ['id', 'file_path', 'filename'] },
      { model: User,     as: 'professor', attributes: ['id', 'first_name', 'last_name', 'email'] },
    ],
  });

const create  = (data)      => Course.create(data);
const update  = (id, data)  => Course.update(data, { where: { id } });
const destroy = (id)        => Course.destroy({ where: { id } });

const countByCategory = (categoryId) =>
  Course.count({ where: { category_id: categoryId } });

module.exports = { getAll, findById, create, update, destroy, countByCategory };
