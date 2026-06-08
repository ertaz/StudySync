const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const CourseNote = sequelize.define(
  'CourseNote',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'course_notes',
    timestamps: false,
  }
);

module.exports = CourseNote;