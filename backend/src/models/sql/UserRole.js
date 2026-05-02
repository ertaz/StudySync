const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
 
const UserRole = sequelize.define('UserRole', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:     { type: DataTypes.INTEGER, allowNull: false },
  role_id:     { type: DataTypes.INTEGER, allowNull: false },
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'UserRoles',
  timestamps: false,
});
 
module.exports = UserRole;
 