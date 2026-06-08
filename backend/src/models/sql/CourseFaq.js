const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const CourseFaq = sequelize.define('CourseFaq', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id:      { type: DataTypes.INTEGER, allowNull: false },
  faqcategory_id: { type: DataTypes.INTEGER, allowNull: false },
  question:       { type: DataTypes.TEXT, allowNull: false },
  answer:         { type: DataTypes.TEXT, allowNull: false },
  created_by:     { type: DataTypes.INTEGER, defaultValue: null },
  updated_by:     { type: DataTypes.INTEGER, defaultValue: null },
}, {
  tableName:  'course_faqs',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at',
});

module.exports = CourseFaq;