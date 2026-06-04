const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const SubmissionFile = sequelize.define('SubmissionFile', {
  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true
  },
  submission_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: { model: 'Submissions', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'CASCADE'
  },
  file_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: { model: 'Files', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'CASCADE'
  }
}, {
  tableName:  'SubmissionFiles',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false
});

module.exports = SubmissionFile;