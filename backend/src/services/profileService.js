// src/services/profileService.js
const bcrypt = require('bcryptjs');
const repo   = require('../repositories/profileRepository');

/**
 * Get the full profile of the currently logged-in user.
 * Returns base user fields + studentProfile or professorProfile depending on role.
 */
const getMyProfile = async (user_id) => {
  const user = await repo.getProfileByUserId(user_id);

  if (!user) {
    throw { status: 404, message: 'User not found.' };
  }

  const roleName = user.roles?.[0]?.name || 'student';

  const base = {
    id:         user.id,
    first_name: user.first_name,
    last_name:  user.last_name,
    email:      user.email,
    is_active:  user.is_active,
    created_at: user.created_at,
    role:       roleName,
  };

  if (roleName === 'student' && user.studentProfile) {
    base.profile = {
      student_number:  user.studentProfile.student_number,
      major:           user.studentProfile.major,
      enrollment_year: user.studentProfile.enrollment_year,
      date_of_birth:   user.studentProfile.date_of_birth,
      phone_number:    user.studentProfile.phone_number,
    };
  }

  if (roleName === 'professor' && user.professorProfile) {
    base.profile = {
      title:               user.professorProfile.title,
      department:          user.professorProfile.department,
      years_of_experience: user.professorProfile.years_of_experience,
      phone_number:        user.professorProfile.phone_number,
    };
  }

  return base;
};

/**
 * Update the currently logged-in user's profile.
 * Handles base user fields and role-specific profile fields separately.
 * Password update is optional — only hashed & saved if provided.
 */
const updateMyProfile = async (user_id, role, body) => {
  const {
    first_name,
    last_name,
    current_password,
    new_password,
    // student fields
    major,
    date_of_birth,
    phone_number,
    // professor fields
    title,
    department,
    years_of_experience,
  } = body;

  // --- Base user update ---
  const userUpdate = { updated_by: user_id };

  if (first_name) userUpdate.first_name = first_name.trim();
  if (last_name)  userUpdate.last_name  = last_name.trim();

  // Password change — only if both current and new are supplied
  if (new_password) {
    if (!current_password) {
      throw { status: 400, message: 'Please provide your current password to set a new one.' };
    }

    // Re-fetch with password_hash for verification
    const { User } = require('../models/index');
    const userWithHash = await User.findByPk(user_id, {
      attributes: ['id', 'password_hash'],
    });

    const valid = await bcrypt.compare(current_password, userWithHash.password_hash);
    if (!valid) {
      throw { status: 400, message: 'Current password is incorrect.' };
    }

    userUpdate.password_hash = await bcrypt.hash(new_password, 12);
  }

  await repo.updateUser(user_id, userUpdate);

  // --- Role-specific profile update ---
  if (role === 'student') {
    const profileData = { updated_by: user_id };
    if (major         !== undefined) profileData.major         = major;
    if (date_of_birth !== undefined) profileData.date_of_birth = date_of_birth || null;
    if (phone_number  !== undefined) profileData.phone_number  = phone_number  || null;

    await repo.upsertStudentProfile(user_id, profileData);
  }

  if (role === 'professor') {
    const profileData = { updated_by: user_id };
    if (title               !== undefined) profileData.title               = title               || null;
    if (department          !== undefined) profileData.department          = department          || null;
    if (phone_number        !== undefined) profileData.phone_number        = phone_number        || null;
    if (years_of_experience !== undefined) profileData.years_of_experience = years_of_experience || 0;

    await repo.upsertProfessorProfile(user_id, profileData);
  }

  // Return the refreshed profile
  return getMyProfile(user_id);
};

module.exports = { getMyProfile, updateMyProfile };