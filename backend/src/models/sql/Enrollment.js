const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// FIXES:
// 1. updated_by: allowNull: false → allowNull: true
//    Problem: kur krijohet enrollment për herë të parë,
//    updated_by nuk ka vlerë ende — INSERT do të dështojë
//    nëse kolona është NOT NULL pa defaultValue.
//    Zgjidhja: lejo NULL (updated_by vendoset vetëm kur dikush e modifikon).
//
// 2. user_id + course_id: shtohet references për FK të saktë në DB
//
// 3. Shtohet UNIQUE constraint për (user_id, course_id)
//    për të parandaluar regjistrime të dyfishta në nivel DB

const Enrollment = sequelize.define('Enrollment', {

  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true
  },

  user_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: {
      model: 'Users',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'   // user i fshirë → enrollments e tij fshihen
  },

  course_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: {
      model: 'Courses',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'   // kurs i fshirë → enrollments fshihen
  },

  enrolled_at: {
    type:         DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  created_by: {
    type:      DataTypes.INTEGER,
    allowNull: false
  },

  updated_by: {
    type:      DataTypes.INTEGER,
    allowNull: true,    // FIX: ishte allowNull: false — INSERT i ri do dështonte
    defaultValue: null
  }

}, {
  tableName:  'Enrollments',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id'],  // FIX: parandalon duplicate enrollment në DB level
      name:   'uq_enrollment_user_course'
    }
  ]
});

module.exports = Enrollment;
