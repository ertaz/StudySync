const sequelize = require('../config/db');

const User             = require('./sql/User');
const Role             = require('./sql/Role');
const UserRole         = require('./sql/UserRole');
const RefreshToken     = require('./sql/RefreshToken');
const StudentProfile   = require('./sql/StudentProfile');
const ProfessorProfile = require('./sql/ProfessorProfile');
const AuditLog         = require('./sql/AuditLog');
const CourseSection    = require('./sql/CourseSection');
const Lesson           = require('./sql/Lesson');
const Course           = require('./sql/Course');
const File             = require('./sql/File');
const Category         = require('./sql/Category');
const Enrollment       = require('./sql/Enrollment');
const Assignment       = require('./sql/Assignment');
const Submission       = require('./sql/Submission');

// 🔥 IMPORTANT: vetëm import i associations (NUK deklarohen këtu)
require('./sql/associations');

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  RefreshToken,
  StudentProfile,
  ProfessorProfile,
  AuditLog,
  CourseSection,
  Lesson,
  Course,
  File,
  Category,
  Enrollment,
  Assignment,
  Submission,
};