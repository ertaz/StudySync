const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Notification = sequelize.define('Notification', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  type:       { type: DataTypes.STRING(50), allowNull: false },
  title:      { type: DataTypes.STRING(255), allowNull: false },
  message:    { type: DataTypes.TEXT },
  is_read:    { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'notifications',
  timestamps: false,
});

module.exports = Notification;