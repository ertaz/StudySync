const service = require('../services/submissionService');

const getAll = async (req, res) => {
  try {
    const data = await service.getAllSubmissions(req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const data = await service.getSubmissionById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getByAssignment = async (req, res) => {
  try {
    const data = await service.getSubmissionsByAssignment(
      req.params.assignmentId,
      req.query
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getByUser = async (req, res) => {
  try {
    const data = await service.getSubmissionsByUser(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Student sheh submission e tij për një assignment
const getMySubmission = async (req, res) => {
  try {
    const data = await service.getMySubmission(
      req.params.assignmentId,
      req.user.id
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    if (!req.body?.assignment_id) {
      return res.status(400).json({ success: false, message: 'assignment_id missing' });
    }
    const submission = await service.createSubmission({
      assignment_id: Number(req.body.assignment_id),
      user_id:       req.user.id,
      files:         req.files || [],
      created_by:    req.user.id,
    });
    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    console.error(err.stack);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Student shton file të reja
const addFiles = async (req, res) => {
  try {
    const data = await service.addFilesToSubmission({
      submissionId: req.params.id,
      userId:       req.user.id,
      files:        req.files || [],
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Profesori vlerëson
const update = async (req, res) => {
  try {
    await service.updateSubmission(req.params.id, {
      grade:      req.body.grade,
      feedback:   req.body.feedback,
      updated_by: req.user.id,
    });
    res.json({ success: true, message: 'Submission updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Student fshin një file të vetme
const removeFile = async (req, res) => {
  try {
    await service.removeFileFromSubmission({
      fileId: req.params.fileId,
      userId: req.user.id,
    });
    res.json({ success: true, message: 'File removed' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await service.deleteSubmission(req.params.id);
    res.json({ success: true, message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAll, getOne, getByAssignment, getByUser,
  getMySubmission, create, addFiles, update, removeFile, remove,
};