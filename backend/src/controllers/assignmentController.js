const service = require('../services/assignmentService');

// ─────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const filters = {
      title: req.query.title,
      description: req.query.description,
      course_id: req.query.course_id,
      section_id: req.query.section_id, // ✅ NEW
      due_from: req.query.due_from,
      due_to: req.query.due_to
    };

    const data = await service.getAllAssignmentsWithFiles(
      req.user.id,
      req.user.role,
      filters
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────
const getOne = async (req, res) => {
  try {
    const data = await service.getAssignmentByIdSecure(
      req.params.id,
      req.user.id,
      req.user.role
    );

    res.json({ success: true, data });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 403;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const assignment = await service.createAssignmentSecure(
      req.body,
      req.user.id,
      req.user.role,
      req.files || []
    );

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    const status = err.message.includes('Unauthorized') ? 403 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const assignment = await service.updateAssignment(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role, // ✅ IMPORTANT FIX
      req.files || []
    );

    res.json({ success: true, data: assignment });
  } catch (err) {
    const status = err.message.includes('Unauthorized') ? 403 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    await service.deleteAssignment(
      req.params.id,
      req.user.id,
      req.user.role // ✅ IMPORTANT FIX
    );

    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 403;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE ATTACHMENT
// ─────────────────────────────────────────────
const removeAttachment = async (req, res) => {
  try {
    await service.deleteAttachment(
      req.params.id,
      req.params.fileId,
      req.user.id,
      req.user.role
    );

    res.json({ success: true, message: 'Attachment deleted' });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 403;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const data = await service.getAssignmentStats(
      req.user.id,
      req.user.role
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  removeAttachment,
  getStats
};