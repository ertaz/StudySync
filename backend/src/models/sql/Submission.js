const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Submission = sequelize.define('Submission', {
  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true
  },

  assignment_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Assignments', key: 'id' },
    onUpdate:  'CASCADE',
    onDelete:  'CASCADE'
  },

  user_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onUpdate:  'CASCADE',
    onDelete:  'CASCADE'
  },

  // file_id HIQET — zëvendësohet nga SubmissionFiles

  submitted_at: {
    type:         DataTypes.DATE,
    defaultValue: DataTypes.NOW   // koha e dorëzimit, e rëndësishme për filtrin "me vonesë/në kohë"
  },

  is_late: {
    type:         DataTypes.TINYINT,
    defaultValue: 0   // llogaritet në backend kur krijohet: submitted_at > assignment.deadline
  },

  grade: {
    type: DataTypes.DECIMAL(5, 2)
  },

  feedback: {
    type: DataTypes.TEXT
  },

  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER }

}, {
  tableName:  'Submissions',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at'
});

module.exports = Submission;