const { User, Role, UserRole, ProfessorProfile, AuditLog } = require('../models/index');

const findUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const createUser = async (data) => {
  return User.create(data);
};

const updateUserCreatedBy = async (user_id, admin_id) => {
  return User.update(
    { created_by: admin_id, updated_by: admin_id },
    { where: { id: user_id } }
  );
};

const findRoleByName = async (name) => {
  return Role.findOne({ where: { name } });
};

const assignRoleToUser = async (user_id, role_id) => {
  return UserRole.create({ user_id, role_id });
};

const createProfessorProfile = async (data) => {
  return ProfessorProfile.create(data);
};

const getAllProfessors = async () => {
  return User.findAll({
    include: [
      {
        model: Role,
        through: { attributes: [] },
        attributes: ['name'],
        where: { name: 'professor' },
      },
      {
        model: ProfessorProfile,
        attributes: ['title', 'department', 'years_of_experience', 'phone_number'],
      },
    ],
    attributes: { exclude: ['password_hash'] },
  });
};

const createAuditLog = async (data) => {
  return AuditLog.create(data);
};

module.exports = {
  findUserByEmail,
  createUser,
  updateUserCreatedBy,
  findRoleByName,
  assignRoleToUser,
  createProfessorProfile,
  getAllProfessors,
  createAuditLog,
};