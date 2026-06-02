// src/models/sql/associations.js
const Course   = require('./Course');
const Category = require('./Category');
const Enrollment = require('./Enrollment');
const User       = require('./User');  
const File     = require('./File');
const Assignment = require('./Assignment');
const Submission = require('./Submission');

Course.belongsTo(Category, { foreignKey: 'category_id',       as: 'category'  });
Category.hasMany(Course,   { foreignKey: 'category_id',       as: 'courses'   });

Course.belongsTo(File,     { foreignKey: 'thumbnail_file_id', as: 'thumbnail' });
File.hasOne(Course,        { foreignKey: 'thumbnail_file_id', as: 'course'    });

// Enrollments
User.hasMany(Enrollment,    { foreignKey: 'user_id',   as: 'enrollments' });
Enrollment.belongsTo(User,  { foreignKey: 'user_id',   as: 'student'     });

Course.hasMany(Enrollment,      { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course,    { foreignKey: 'course_id', as: 'course'      });

Course.belongsTo(User, { foreignKey: 'professor_id', as: 'professor' });
User.hasMany(Course,   { foreignKey: 'professor_id', as: 'taughtCourses' });

Course.hasMany(Assignment,{
    foreignKey:'course_id',
    as:'assignments'
  });
  
  Assignment.belongsTo(Course,{
    foreignKey:'course_id',
    as:'course'
  });

  Assignment.hasMany(Submission,{
    foreignKey:'assignment_id',
    as:'submissions'
  });
  
  Submission.belongsTo(Assignment,{
    foreignKey:'assignment_id',
    as:'assignment'
  });

  User.hasMany(Submission,{
    foreignKey:'user_id',
    as:'submissions'
  });
  
  Submission.belongsTo(User,{
    foreignKey:'user_id',
    as:'student'
  });

  File.hasOne(Submission,{
    foreignKey:'file_id',
    as:'submission'
  });
  
  Submission.belongsTo(File,{
    foreignKey:'file_id',
    as:'file'
  });