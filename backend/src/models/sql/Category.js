const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255) },
  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER },
}, {
  tableName: 'Categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Category;
