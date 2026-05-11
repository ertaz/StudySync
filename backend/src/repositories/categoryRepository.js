const Category = require('../models/sql/Category');

const getAll = () => Category.findAll({ order: [['name', 'ASC']] });

const findById = (id) => Category.findByPk(id);

const create = (data) => Category.create(data);

module.exports = { getAll, findById, create };
