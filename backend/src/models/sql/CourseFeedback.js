const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const CourseFeedback = sequelize.define(
  'CourseFeedback',
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

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('pending', 'reviewed'),
      defaultValue: 'pending',
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'course_feedback',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['course_id', 'student_id'],
      },
    ],
  }
);

module.exports = CourseFeedback;