// src/repositories/profileRepository.js
const { User, Role, StudentProfile, ProfessorProfile } = require('../models/index');

/**
 * Fetch full profile for any user.
 * Includes base user fields + role-specific profile (student or professor).
 */
const getProfileByUserId = async (user_id) => {
  return User.findOne({
    where: { id: user_id },
    attributes: { exclude: ['password_hash'] },
    include: [
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] },
        attributes: ['id', 'name'],
      },
      {
        model: StudentProfile,
        as: 'studentProfile',
        required: false,
      },
      {
        model: ProfessorProfile,
        as: 'professorProfile',
        required: false,
      },
    ],
  });
};

/**
 * Update the Users table for a given user.
 */
const updateUser = async (user_id, data) => {
  return User.update(data, { where: { id: user_id } });
};

/**
 * Update or create a StudentProfile row.
 */
const upsertStudentProfile = async (user_id, data) => {
  const existing = await StudentProfile.findOne({ where: { user_id } });
  if (existing) {
    return existing.update(data);
  }
  return StudentProfile.create({ user_id, ...data });
};

/**
 * Update or create a ProfessorProfile row.
 */
const upsertProfessorProfile = async (user_id, data) => {
  const existing = await ProfessorProfile.findOne({ where: { user_id } });
  if (existing) {
    return existing.update(data);
  }
  return ProfessorProfile.create({ user_id, ...data });
};

module.exports = {
  getProfileByUserId,
  updateUser,
  upsertStudentProfile,
  upsertProfessorProfile,
};