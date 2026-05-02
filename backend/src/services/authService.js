const bcrypt = require('bcryptjs');
const repo   = require('../repositories/authRepository');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} = require('../utils/tokenUtils');

// ── Register (students only — professors are created by admin) ──
const register = async ({
  first_name, last_name, email, password,
  student_number, major, enrollment_year, date_of_birth, phone_number,
  ip
}) => {

  // 1. Check if email already exists
  const existing = await repo.findUserByEmail(email);
  if (existing) {
    throw { status: 409, message: 'Email is already registered.' };
  }

  // 2. Check if student number already exists
  const existingStudent = await repo.findStudentByNumber(student_number);
  if (existingStudent) {
    throw { status: 409, message: 'Student number is already registered.' };
  }

  // 3. Hash the password
  const password_hash = await bcrypt.hash(password, 12);

  // 4. Create user
  const user = await repo.createUser({ first_name, last_name, email, password_hash });
  await repo.updateUserCreatedBy(user.id);

  // 5. Assign 'student' role
  const studentRole = await repo.findRoleByName('student');
  if (!studentRole) throw { status: 500, message: 'Student role not found. Run seed.' };
  await repo.assignRoleToUser(user.id, studentRole.id);

  // 6. Create student profile with all the fields from the form
  await repo.createStudentProfile({
    user_id:         user.id,
    student_number,
    major,
    enrollment_year: enrollment_year || new Date().getFullYear(),
    date_of_birth:   date_of_birth || null,
    phone_number:    phone_number || null,
    created_by:      user.id,
    updated_by:      user.id,
  });

  // 7. Audit log
  await repo.createAuditLog({
    user_id:    user.id,
    action:     'REGISTER',
    entity:     'User',
    entity_id:  user.id,
    new_value:  JSON.stringify({ email, student_number, major }),
    ip_address: ip,
  });

  return { id: user.id, first_name, last_name, email, role: 'student' };
};

// ── Login ─────────────────────────────────────────────────────
const login = async ({ email, password, ip }) => {

  // 1. Find user with roles
  const user = await repo.findUserByEmail(email);
  if (!user) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  // 2. Check is_active
  if (!user.is_active) {
    throw { status: 403, message: 'Your account has been deactivated.' };
  }

  // 3. Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  // 4. Get the user's role name
  const roleName = user.Roles?.[0]?.name || 'student';

  // 5. Build JWT payload
  const payload = { id: user.id, email: user.email, role: roleName };

  // 6. Generate tokens
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // 7. Hash & store refresh token in DB
  const tokenHash = hashToken(refreshToken);
  await repo.saveRefreshToken(user.id, tokenHash, getRefreshTokenExpiry());

  // 8. Audit log
  await repo.createAuditLog({
    user_id:    user.id,
    action:     'LOGIN',
    entity:     'User',
    entity_id:  user.id,
    ip_address: ip,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id:         user.id,
      first_name: user.first_name,
      last_name:  user.last_name,
      email:      user.email,
      role:       roleName,
    },
  };
};

// ── Refresh Access Token ──────────────────────────────────────
const refresh = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw { status: 401, message: 'No refresh token provided.' };
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw { status: 401, message: 'Invalid or expired refresh token.' };
  }

  const tokenHash   = hashToken(rawRefreshToken);
  const storedToken = await repo.findRefreshToken(tokenHash);
  if (!storedToken) {
    throw { status: 401, message: 'Refresh token has been revoked or expired.' };
  }

  const payload     = { id: decoded.id, email: decoded.email, role: decoded.role };
  const accessToken = generateAccessToken(payload);
  const user        = { id: decoded.id, email: decoded.email, role: decoded.role };

  return { accessToken, user };
};

// ── Logout ────────────────────────────────────────────────────
const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await repo.revokeRefreshToken(tokenHash);
};

// ── Logout from all devices ───────────────────────────────────
const logoutAll = async (userId) => {
  await repo.revokeAllUserTokens(userId);
};

module.exports = { register, login, refresh, logout, logoutAll };