// src/models/sql/File.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const File = sequelize.define('File', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  entity:      { type: DataTypes.STRING(100), allowNull: false },
  entity_id:   { type: DataTypes.INTEGER, allowNull: false },
  filename:    { type: DataTypes.STRING(255), allowNull: false },
  file_path:   { type: DataTypes.STRING(500), allowNull: false },
  file_size:   { type: DataTypes.INTEGER },
  uploaded_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName:  'Files',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false,
});

module.exports = File;
