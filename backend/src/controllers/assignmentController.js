const service = require('../services/assignmentService');

const getAll = async (req, res) => {
  try {
    const filters = {
      title:       req.query.title,
      description: req.query.description,
      course_id:   req.query.course_id,
      due_from:    req.query.due_from,
      due_to:      req.query.due_to
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

const getOne = async (req, res) => {
  try {
    const data = await service.getAssignmentByIdWithFiles(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const assignment = await service.createAssignment(
      req.body,
      req.user.id,
      req.files || []
    );

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const assignment = await service.updateAssignment(
      req.params.id,
      req.body,
      req.user.id,
      req.files || []
    );

    res.json({ success: true, data: assignment });
  } catch (err) {
    const status = err.message.startsWith('Unauthorized') ? 403 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await service.deleteAssignment(req.params.id, req.user.id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    const status = err.message.startsWith('Unauthorized') ? 403 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const removeAttachment = async (req, res) => {
  try {
    await service.deleteAttachment(
      req.params.id,
      req.params.fileId,
      req.user.id
    );

    res.json({ success: true, message: 'Attachment deleted' });
  } catch (err) {
    const status = err.message.startsWith('Unauthorized') ? 403 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const data = await service.getAssignmentStats(req.user.id, req.user.role);
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
