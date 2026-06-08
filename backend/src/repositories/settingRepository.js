const Setting = require('../models/sql/Setting');

const getAll  = ()          => Setting.findAll({ order: [['key', 'ASC']] });
const getByKey = (key)      => Setting.findOne({ where: { key } });
const update  = (key, value) => Setting.update({ value }, { where: { key } });

module.exports = { getAll, getByKey, update };