const professorService = require('../services/professorService');

// ── POST /api/admin/professors ────────────────────────────────
const createProfessor = async (req, res) => {
  try {
    const {
      first_name, last_name, email, password,
      title, department, years_of_experience, phone_number,
    } = req.body;

    const admin_id = req.user.id; // from JWT middleware
    const ip       = req.ip || req.socket.remoteAddress;

    const result = await professorService.createProfessor({
      first_name, last_name, email, password,
      title, department, years_of_experience, phone_number,
      admin_id, ip,
    });

    return res.status(201).json({
      message:   'Professor created successfully.',
      professor: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || 'Server error.',
    });
  }
};

// ── GET /api/admin/professors ─────────────────────────────────
const getAllProfessors = async (req, res) => {
  try {
    const professors = await professorService.getAllProfessors();
    return res.status(200).json({ professors });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createProfessor, getAllProfessors };