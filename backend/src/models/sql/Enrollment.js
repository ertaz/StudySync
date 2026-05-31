const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Enrollment = sequelize.define('Enrollment', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:     { type: DataTypes.INTEGER, allowNull: false },
  course_id:   { type: DataTypes.INTEGER, allowNull: false },
  enrolled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created_by:  { type: DataTypes.INTEGER, allowNull: false },
  updated_by:  { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'Enrollments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Enrollment;