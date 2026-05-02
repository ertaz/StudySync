const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const ProfessorProfile = sequelize.define('ProfessorProfile', {
  id:                  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, unique: true },
  title:               { type: DataTypes.STRING(50) },
  department:          { type: DataTypes.STRING(150) },
  years_of_experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  phone_number:        { type: DataTypes.STRING(20) },
  created_by:          { type: DataTypes.INTEGER, defaultValue: null },
  updated_by:          { type: DataTypes.INTEGER, defaultValue: null },
}, {
  tableName: 'ProfessorProfiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ProfessorProfile;