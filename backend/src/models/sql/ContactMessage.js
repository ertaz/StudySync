const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const ContactMessage = sequelize.define('ContactMessage', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  name:       { type: DataTypes.STRING(150), allowNull: false },
  email:      { type: DataTypes.STRING(255), allowNull: false },
  subject:    { type: DataTypes.STRING(255), allowNull: false },
  message:    { type: DataTypes.TEXT, allowNull: false },
  is_read:    { type: DataTypes.TINYINT, defaultValue: 0 },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
  updated_by: { type: DataTypes.INTEGER, defaultValue: null },
}, {
  tableName: 'ContactMessages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ContactMessage;