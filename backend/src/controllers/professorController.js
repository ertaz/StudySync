const professorService = require('../services/professorService');

// ── POST /api/admin/professors ────────────────────────────────
const createProfessor = async (req, res) => {
  try {
    const {
      first_name, last_name, email, password,
      title, department, years_of_experience, phone_number,
    } = req.body;

    const admin_id = req.user.id;
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

// ── GET /api/admin/professors/:id ─────────────────────────────
const getProfessorById = async (req, res) => {
  try {
    const professor_id = parseInt(req.params.id);
    const professor = await professorService.getProfessorById(professor_id); // Sigurohu që ky funksion ekziston në service
    
    if (!professor) {
      return res.status(404).json({ message: 'Professor not found.' });
    }
    
    return res.status(200).json({ professor });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || 'Server error.',
    });
  }
};

// ── PUT /api/admin/professors/:id ─────────────────────────────
const updateProfessor = async (req, res) => {
  try {
    const professor_id = parseInt(req.params.id);
    const {
      first_name, last_name, email, password,
      title, department, years_of_experience, phone_number,
    } = req.body;

    const admin_id = req.user.id;
    const ip       = req.ip || req.socket.remoteAddress;

    const result = await professorService.updateProfessor({
      professor_id, first_name, last_name, email, password,
      title, department, years_of_experience, phone_number,
      admin_id, ip,
    });

    return res.status(200).json({
      message:   'Professor updated successfully.',
      professor: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || 'Server error.',
    });
  }
};

// ── DELETE /api/admin/professors/:id ──────────────────────────
const deleteProfessor = async (req, res) => {
  try {
    const professor_id = parseInt(req.params.id);
    const admin_id     = req.user.id;
    const ip           = req.ip || req.socket.remoteAddress;

    const result = await professorService.deleteProfessor({ professor_id, admin_id, ip });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || 'Server error.',
    });
  }
};

module.exports = { 
  createProfessor, 
  getAllProfessors, 
  getProfessorById, 
  updateProfessor, 
  deleteProfessor 
};