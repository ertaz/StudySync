const authService = require('../services/authService');
const { setRefreshCookie, clearRefreshCookie } = require('../utils/cookieUtils');

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res) => {
  try {
    const {
      first_name, last_name, email, password,
      // StudentProfile fields
      student_number, major, enrollment_year, date_of_birth, phone_number,
    } = req.body;

    const ip = req.ip || req.socket.remoteAddress;

    const result = await authService.register({
      first_name, last_name, email, password,
      student_number, major, enrollment_year, date_of_birth, phone_number,
      ip,
    });

    return res.status(201).json({
      message: 'Registration successful. Please log in.',
      user: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Server error.' });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress;

    const { accessToken, refreshToken, user } = await authService.login({ email, password, ip });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: 'Login successful.',
      accessToken,
      user,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Server error.' });
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────

const refresh = async (req, res) => {
  try {
    const rawToken = req.cookies.refreshToken;

    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await authService.refresh(rawToken);

    // Replace old refresh cookie with the new one
    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({
      accessToken,
      user,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || 'Server error.',
    });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
const logout = async (req, res) => {
  try {
    const rawToken = req.cookies.refreshToken;
    await authService.logout(rawToken);
    clearRefreshCookie(res);
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Server error.' });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
const me = (req, res) => {
  return res.status(200).json({ user: req.user });
};

const getProfessors = async (req, res) => {
  try {
    const professors = await userRepo.findProfessors(); // make sure userRepo is already required at the top
    res.json({ success: true, data: professors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, refresh, logout, me, getProfessors };