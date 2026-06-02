const File = require('../models/sql/File');

const createFile = (data) => File.create(data);

const getByEntity = (entity, entity_id) =>
  File.findAll({ where: { entity, entity_id } });

const deleteFile = (id) =>
  File.destroy({ where: { id } });

module.exports = {
  createFile,
  getByEntity,
  deleteFile
};