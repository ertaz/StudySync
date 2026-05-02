const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
 
const RefreshToken = sequelize.define('RefreshToken', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  token_hash: { type: DataTypes.STRING(255), allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  revoked_at: { type: DataTypes.DATE, defaultValue: null },
}, {
  tableName: 'RefreshTokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});
 
module.exports = RefreshToken;