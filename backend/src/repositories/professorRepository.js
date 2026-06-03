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
    where: { is_active: 1 },
    include: [
      {
        model: Role,
        as: 'roles',
        where: { name: 'professor' }, 
        attributes: ['name'],
        through: { attributes: [] },
        required: true
      },
      {
        model: ProfessorProfile,
        as: 'professorProfile',
        attributes: [
          'title',
          'department',
          'years_of_experience',
          'phone_number'
        ],
        required: false
      }
    ],
    attributes: { exclude: ['password_hash'] }
  });
};

const getProfessorById = async (user_id) => {
  return User.findOne({
    where: { id: user_id },
    include: [
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] },
        attributes: ['name'],
        required: false
      },
      {
        model: ProfessorProfile,
        as: 'professorProfile', 
        attributes: [
          'title',
          'department',
          'years_of_experience',
          'phone_number'
        ],
      },
    ],
    attributes: { exclude: ['password_hash'] },
  });
};

const updateProfessor = async (user_id, userData, profileData) => {
  await User.update(userData, { where: { id: user_id } });
  await ProfessorProfile.update(profileData, { where: { user_id } });
};

const deactivateProfessor = async (user_id) => {
  return User.update({ is_active: 0 }, { where: { id: user_id } });
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
  getProfessorById,
  updateProfessor,
  deactivateProfessor,
  createAuditLog,
};