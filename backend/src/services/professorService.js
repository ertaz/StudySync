const bcrypt = require('bcryptjs');
const repo   = require('../repositories/professorRepository');

// ── Create Professor (called by Admin only) ───────────────────
const createProfessor = async ({
  first_name, last_name, email, password,
  title, department, years_of_experience, phone_number,
  admin_id, ip,
}) => {

  // 1. Check email is not already taken
  const existing = await repo.findUserByEmail(email);
  if (existing) {
    throw { status: 409, message: 'A user with this email already exists.' };
  }

  // 2. Hash the password
  const password_hash = await bcrypt.hash(password, 12);

  // 3. Create user row
  const user = await repo.createUser({
    first_name,
    last_name,
    email,
    password_hash,
    is_active: 1,
  });

  // 4. Set created_by and updated_by to the admin's ID
  await repo.updateUserCreatedBy(user.id, admin_id);

  // 5. Assign 'professor' role
  const professorRole = await repo.findRoleByName('professor');
  if (!professorRole) {
    throw { status: 500, message: 'Professor role not found. Run schema.sql seed.' };
  }
  await repo.assignRoleToUser(user.id, professorRole.id);

  // 6. Create professor profile
  await repo.createProfessorProfile({
    user_id:             user.id,
    title:               title || null,
    department:          department || null,
    years_of_experience: years_of_experience || 0,
    phone_number:        phone_number || null,
    created_by:          admin_id,
    updated_by:          admin_id,
  });

  // 7. Audit log
  await repo.createAuditLog({
    user_id:    admin_id,
    action:     'CREATE_PROFESSOR',
    entity:     'User',
    entity_id:  user.id,
    new_value:  JSON.stringify({ email, first_name, last_name, department }),
    ip_address: ip,
  });

  return {
    id:         user.id,
    first_name,
    last_name,
    email,
    role:       'professor',
    department,
    title,
  };
};

// ── Get all professors ────────────────────────────────────────
const getAllProfessors = async () => {
  return repo.getAllProfessors();
};

// ── Update Professor ──────────────────────────────────────────
const updateProfessor = async ({
  professor_id, first_name, last_name, email, password,
  title, department, years_of_experience, phone_number,
  admin_id, ip,
}) => {

  // 1. Make sure the professor exists
  const professor = await repo.getProfessorById(professor_id);
  if (!professor) {
    throw { status: 404, message: 'Professor not found.' };
  }

  // 2. Email uniqueness check — allow keeping the same email
  const existing = await repo.findUserByEmail(email);
  if (existing && existing.id !== professor_id) {
    throw { status: 409, message: 'This email is already used by another user.' };
  }

  // 3. Build the userData object for the Users table
  const userData = {
    first_name,
    last_name,
    email,
    updated_by: admin_id,
  };

  // 4. If admin provided a new password, hash it and include it
  if (password && password.trim() !== '') {
    userData.password_hash = await bcrypt.hash(password, 12);
  }

  // 5. Profile fields
  const profileData = {
    title:               title               || null,
    department:          department          || null,
    years_of_experience: years_of_experience || 0,
    phone_number:        phone_number        || null,
    updated_by:          admin_id,
  };

  await repo.updateProfessor(professor_id, userData, profileData);

  // 6. Audit log — note whether password was changed
  await repo.createAuditLog({
    user_id:    admin_id,
    action:     'UPDATE_PROFESSOR',
    entity:     'User',
    entity_id:  professor_id,
    new_value:  JSON.stringify({
      email, first_name, last_name, department,
      password_changed: !!(password && password.trim() !== ''),
    }),
    ip_address: ip,
  });

  return { id: professor_id, first_name, last_name, email, department, title };
};

// ── Delete (deactivate) Professor ─────────────────────────────
const deleteProfessor = async ({ professor_id, admin_id, ip }) => {

  const professor = await repo.getProfessorById(professor_id);
  if (!professor) {
    throw { status: 404, message: 'Professor not found.' };
  }

  await repo.deactivateProfessor(professor_id);

  await repo.createAuditLog({
    user_id:    admin_id,
    action:     'DELETE_PROFESSOR',
    entity:     'User',
    entity_id:  professor_id,
    new_value:  JSON.stringify({ is_active: 0 }),
    ip_address: ip,
  });

  return { message: 'Professor deactivated successfully.' };
};

module.exports = { createProfessor, getAllProfessors, updateProfessor, deleteProfessor };
