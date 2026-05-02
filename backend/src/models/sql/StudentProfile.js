const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const StudentProfile = sequelize.define('StudentProfile', {
  id:              { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:         { type: DataTypes.INTEGER, allowNull: false },
  student_number:  { type: DataTypes.STRING(50), allowNull: false, unique: true },
  major:           { type: DataTypes.STRING(150), allowNull: false },
  enrollment_year: { type: DataTypes.INTEGER, allowNull: false },
  date_of_birth:   { type: DataTypes.DATEONLY, allowNull: true },
  phone_number:    { type: DataTypes.STRING(20), allowNull: true },
  created_by:      { type: DataTypes.INTEGER, allowNull: true },
  updated_by:      { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'StudentProfiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = StudentProfile;