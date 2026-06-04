
const Course           = require('./Course');
const Category         = require('./Category');
const Enrollment       = require('./Enrollment');
const User             = require('./User');
const File             = require('./File');
const Assignment       = require('./Assignment');
const Submission       = require('./Submission');
const CourseSection    = require('./CourseSection');
const Lesson           = require('./Lesson');
const Role             = require('./Role');
const UserRole         = require('./UserRole');
const ProfessorProfile = require('./ProfessorProfile');
const StudentProfile   = require('./StudentProfile');
const RefreshToken     = require('./RefreshToken');
const AuditLog         = require('./AuditLog');

// ─────────────────────────────────────────────
// USER ↔ ROLE
// ─────────────────────────────────────────────
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
});

// ─────────────────────────────────────────────
// USER — PROFILES / TOKENS / AUDIT
// ─────────────────────────────────────────────
User.hasMany(RefreshToken, {
  foreignKey: 'user_id',
  as: 'refreshTokens',
  onDelete: 'CASCADE'
});

RefreshToken.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasOne(StudentProfile, {
  foreignKey: 'user_id',
  as: 'studentProfile',
  onDelete: 'CASCADE'
});

StudentProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasOne(ProfessorProfile, {
  foreignKey: 'user_id',
  as: 'professorProfile',
  onDelete: 'CASCADE'
});

ProfessorProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(AuditLog, {
  foreignKey: 'user_id',
  as: 'auditLogs'
});

AuditLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// ─────────────────────────────────────────────
// CATEGORY ↔ COURSE
// ─────────────────────────────────────────────
Course.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Course, {
  foreignKey: 'category_id',
  as: 'courses'
});

// ─────────────────────────────────────────────
// COURSE — THUMBNAIL (File)
// ─────────────────────────────────────────────
Course.belongsTo(File, {
  foreignKey: 'thumbnail_file_id',
  as: 'thumbnail'
});

File.hasOne(Course, {
  foreignKey: 'thumbnail_file_id',
  as: 'course'
});

// ─────────────────────────────────────────────
// COURSE — PROFESSOR (User)
// ─────────────────────────────────────────────
Course.belongsTo(User, {
  foreignKey: 'professor_id',
  as: 'professor'
});

User.hasMany(Course, {
  foreignKey: 'professor_id',
  as: 'taughtCourses'
});

// ─────────────────────────────────────────────
// COURSE ↔ ENROLLMENT
// ─────────────────────────────────────────────
User.hasMany(Enrollment, {
  foreignKey: 'user_id',
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Enrollment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'student'
});

Course.hasMany(Enrollment, {
  foreignKey: 'course_id',
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Enrollment.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// ─────────────────────────────────────────────
// COURSE ↔ SECTION
// ─────────────────────────────────────────────
Course.hasMany(CourseSection, {
  foreignKey: 'course_id',
  as: 'sections',
  onDelete: 'CASCADE'
});

CourseSection.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// ─────────────────────────────────────────────
// SECTION ↔ LESSON
// ─────────────────────────────────────────────
CourseSection.hasMany(Lesson, {
  foreignKey: 'section_id',
  as: 'lessons',
  onDelete: 'CASCADE',
  hooks: true
});

Lesson.belongsTo(CourseSection, {
  foreignKey: 'section_id',
  as: 'section'
});

// ─────────────────────────────────────────────
// SECTION ↔ ASSIGNMENT
// ─────────────────────────────────────────────
CourseSection.hasMany(Assignment, {
  foreignKey: 'section_id',
  as: 'assignments',
  onDelete: 'CASCADE',
  hooks: true
});

Assignment.belongsTo(CourseSection, {
  foreignKey: 'section_id',
  as: 'section'
});

// ─────────────────────────────────────────────
// FILE ↔ LESSON
// ─────────────────────────────────────────────
Lesson.belongsTo(File, {
  foreignKey: 'file_id',
  as: 'file'
});

File.hasMany(Lesson, {
  foreignKey: 'file_id',
  as: 'lessons'
});

// ─────────────────────────────────────────────
// COURSE ↔ ASSIGNMENT ↔ SUBMISSION
// ─────────────────────────────────────────────
Course.hasMany(Assignment, {
  foreignKey: 'course_id',
  as: 'assignments',
  onDelete: 'CASCADE'
});

Assignment.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

Assignment.hasMany(Submission, {
  foreignKey: 'assignment_id',
  as: 'submissions',
  onDelete: 'CASCADE'
});

Submission.belongsTo(Assignment, {
  foreignKey: 'assignment_id',
  as: 'assignment'
});

User.hasMany(Submission, {
  foreignKey: 'user_id',
  as: 'submissions',
  onDelete: 'CASCADE'
});

Submission.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'student'
});

File.hasMany(Submission, {
  foreignKey: 'file_id',
  as: 'submissions'
});

Submission.belongsTo(File, {
  foreignKey: 'file_id',
  as: 'file'
});
