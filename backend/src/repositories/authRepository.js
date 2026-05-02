const { User, Role, UserRole, RefreshToken, StudentProfile, AuditLog } = require('../models/index');
const { Op } = require('sequelize');

const findUserByEmail = async (email) => {
  return User.findOne({
    where: { email },
    include: [{ model: Role, through: { attributes: [] }, attributes: ['id', 'name'] }],
  });
};

const findUserById = async (id) => {
  return User.findByPk(id, {
    include: [{ model: Role, through: { attributes: [] }, attributes: ['id', 'name'] }],
    attributes: { exclude: ['password_hash'] },
  });
};

const createUser = async (data) => {
  return User.create(data);
};

const updateUserCreatedBy = async (user_id) => {
  return User.update(
    { created_by: user_id, updated_by: user_id },
    { where: { id: user_id } }
  );
};

const findRoleByName = async (name) => {
  return Role.findOne({ where: { name } });
};

const assignRoleToUser = async (user_id, role_id) => {
  return UserRole.create({ user_id, role_id });
};

const saveRefreshToken = async (user_id, token_hash, expires_at) => {
  return RefreshToken.create({ user_id, token_hash, expires_at });
};

const findRefreshToken = async (token_hash) => {
  return RefreshToken.findOne({
    where: {
      token_hash,
      revoked_at: null,
      expires_at: { [Op.gt]: new Date() },
    },
  });
};

const revokeRefreshToken = async (token_hash) => {
  return RefreshToken.update(
    { revoked_at: new Date() },
    { where: { token_hash } }
  );
};

const revokeAllUserTokens = async (user_id) => {
  return RefreshToken.update(
    { revoked_at: new Date() },
    { where: { user_id, revoked_at: null } }
  );
};

const findStudentByNumber = async (student_number) => {
  return StudentProfile.findOne({ where: { student_number } });
};

const createStudentProfile = async (data) => {
  return StudentProfile.create(data);
};

const createAuditLog = async (data) => {
  return AuditLog.create(data);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserCreatedBy,
  findRoleByName,
  assignRoleToUser,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  findStudentByNumber,
  createStudentProfile,
  createAuditLog,
};