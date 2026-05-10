const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  category_id: { type: DataTypes.INTEGER },
  thumbnail_file_id: { type: DataTypes.INTEGER },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  updated_by: { type: DataTypes.INTEGER },
}, {
  tableName: 'Courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Course;
