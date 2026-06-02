const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  description: DataTypes.TEXT,

  deadline: DataTypes.DATE,

  max_grade: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 100
  },

  created_by: DataTypes.INTEGER,
  updated_by: DataTypes.INTEGER

}, {
  tableName: 'Assignments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Assignment;