const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// FIXES:
// 1. course_id — shtohet references + onDelete CASCADE
//    (nëse kursi fshihet, assignments e tij fshihen automatikisht)
// 2. created_by — shtohet allowNull: false (profesori duhet regjistruar)
// 3. max_grade — shtohet validate min:0 për të shmangur nota negative

const Assignment = sequelize.define('Assignment', {

  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true
  },

  course_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: {
      model: 'Courses',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'   // kurs i fshirë → assignments fshihen
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CourseSections',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },

  title: {
    type:      DataTypes.STRING(255),
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT
  },

  deadline: {
    type: DataTypes.DATE
  },

  max_grade: {
    type:         DataTypes.DECIMAL(5, 2),
    defaultValue: 100,
    validate: {
      min: 0       // FIX: nota nuk mund të jetë negative
    }
  },

  created_by: {
    type:      DataTypes.INTEGER,
    allowNull: false   // FIX: assignment pa krijues nuk ka sens
  },

  updated_by: {
    type: DataTypes.INTEGER
  }

}, {
  tableName:  'Assignments',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at'
});

module.exports = Assignment;
