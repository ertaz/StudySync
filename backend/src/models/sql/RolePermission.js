const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'RolePermissions',
  timestamps: false,
});

module.exports = RolePermission;