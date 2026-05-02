const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
 
const AuditLog = sequelize.define('AuditLog', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER, defaultValue: null },
  action:     { type: DataTypes.STRING(100), allowNull: false },
  entity:     { type: DataTypes.STRING(100) },
  entity_id:  { type: DataTypes.INTEGER },
  old_value:  { type: DataTypes.TEXT },
  new_value:  { type: DataTypes.TEXT },
  ip_address: { type: DataTypes.STRING(45) },
}, {
  tableName: 'AuditLogs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});
 
module.exports = AuditLog;