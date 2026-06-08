const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const FaqCategory = sequelize.define('FaqCategory', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  created_by:  { type: DataTypes.INTEGER, defaultValue: null },
  updated_by:  { type: DataTypes.INTEGER, defaultValue: null },
}, {
  tableName:  'faq_categories',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at',
});

module.exports = FaqCategory;