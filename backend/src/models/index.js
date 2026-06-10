const sequelize = require('../config/db');

// ── Models ─────────────────────────────
const User             = require('./sql/User');
const Role             = require('./sql/Role');
const UserRole         = require('./sql/UserRole');
const Permission       = require('./sql/Permission');
const RolePermission   = require('./sql/RolePermission');
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
const SubmissionFile   = require('./sql/SubmissionFile');
const Announcement     = require('./sql/Announcement');
const CourseNote = require('./sql/CourseNote');
const CourseFeedback =
  require('./sql/CourseFeedback');

const FaqCategory = require('./sql/FaqCategory');
const CourseFaq   = require('./sql/CourseFaq');
const ContactMessage = require('./sql/ContactMessage');
const Notification = require('./sql/Notification');



// IMPORTANT: associations must run AFTER all models are loaded
require('./sql/associations');

// ── DB object ───────────────────────────
const db = {
  sequelize,
  Sequelize: require('sequelize'),

  User,
  Role,
  UserRole,
  Permission,
  RolePermission,
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
  SubmissionFile,
  Announcement,
  CourseNote,
  CourseFeedback,
  FaqCategory,
  CourseFaq,
  ContactMessage,
  Notification,
};

module.exports = db;