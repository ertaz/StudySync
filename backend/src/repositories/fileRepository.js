// src/repositories/fileRepository.js
const File = require('../models/sql/File');

const createFile = (data) => File.create(data);
const deleteFile = (id)   => File.destroy({ where: { id } });

module.exports = { createFile, deleteFile };
