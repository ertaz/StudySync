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

  // 7. Audit log — record which admin created this professor
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

module.exports = { createProfessor, getAllProfessors };