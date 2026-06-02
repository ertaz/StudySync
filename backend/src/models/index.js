const sequelize = require('../config/db');

const User             = require('./sql/User');
const Role             = require('./sql/Role');
const UserRole         = require('./sql/UserRole');
const RefreshToken     = require('./sql/RefreshToken');
const StudentProfile   = require('./sql/StudentProfile');
const ProfessorProfile = require('./sql/ProfessorProfile');
const AuditLog         = require('./sql/AuditLog');
const CourseSection = require('./sql/CourseSection');
const Lesson = require('./sql/Lesson');
const Course = require('./sql/Course');
const File = require('./sql/File');


// ── Associations ──────────────────────────────────────────────

// User <-> Role (many-to-many through UserRoles)
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

// User -> RefreshTokens
User.hasMany(RefreshToken, { foreignKey: 'user_id' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

// User -> StudentProfile
User.hasOne(StudentProfile, { foreignKey: 'user_id' });
StudentProfile.belongsTo(User, { foreignKey: 'user_id' });

// User -> ProfessorProfile
User.hasOne(ProfessorProfile, { foreignKey: 'user_id' });
ProfessorProfile.belongsTo(User, { foreignKey: 'user_id' });

// User -> AuditLogs
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });
// Course -> Sections
Course.hasMany(CourseSection, {
  foreignKey: 'course_id',
  as: 'sections',
});

CourseSection.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

// Section -> Lessons
CourseSection.hasMany(Lesson, {
  foreignKey: 'section_id',
  as: 'lessons',
  onDelete: 'CASCADE',
  hooks: true,
});

Lesson.belongsTo(CourseSection, {
  foreignKey: 'section_id',
  as: 'section',
});

// Lesson -> File
Lesson.belongsTo(File, {
  foreignKey: "file_id",
  as: "file",
});

File.hasOne(Lesson, {
  foreignKey: "file_id",
  as: "lesson",
});


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

};