const repository = require('../repositories/assignmentRepository');
const Assignment = require('../models/sql/Assignment');
const File = require('../models/sql/File');
const fileRepository = require('../repositories/fileRepository');

// ─────────────────────────────────────────────
// GET ALL WITH FILES (OK)
// ─────────────────────────────────────────────
const getAllAssignmentsWithFiles = async (userId, role, filters = {}) => {
  const assignments = await repository.getAll(filters);

  return Promise.all(
    assignments.map(async (a) => {
      const files = await fileRepository.getByEntity('assignment', a.id);
      return { ...a.toJSON(), attachments: files };
    })
  );
};

// ─────────────────────────────────────────────
// GET BY ID
// ─────────────────────────────────────────────
const getAssignmentByIdWithFiles = async (id) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const files = await fileRepository.getByEntity('assignment', id);

  return {
    ...assignment.toJSON(),
    attachments: files
  };
};

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
const createAssignment = async (data, userId, files = []) => {
  const assignment = await Assignment.create({
    ...data,
    created_by: userId
  });

  if (files.length) {
    await Promise.all(
      files.map(file =>
        File.create({
          entity: 'assignment',
          entity_id: assignment.id,
          filename: file.originalname,
          file_path: `uploads/assignments/${file.filename}`,
          file_size: file.size,
          uploaded_by: userId
        })
      )
    );
  }

  return assignment;
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
const updateAssignment = async (id, data, userId, files = []) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) throw new Error('Assignment not found');

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  await Assignment.update(
    { ...data, updated_by: userId },
    { where: { id } }
  );

  if (files.length) {
    await Promise.all(
      files.map(file =>
        File.create({
          entity: 'assignment',
          entity_id: id,
          filename: file.originalname,
          file_path: `uploads/assignments/${file.filename}`,
          file_size: file.size,
          uploaded_by: userId
        })
      )
    );
  }

  return Assignment.findByPk(id);
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
const deleteAssignment = async (id, userId) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) throw new Error('Assignment not found');

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  await File.destroy({
    where: { entity: 'assignment', entity_id: id }
  });

  await assignment.destroy();
};

// ─────────────────────────────────────────────
// DELETE ATTACHMENT
// ─────────────────────────────────────────────
const deleteAttachment = async (assignmentId, fileId, userId) => {
  const assignment = await Assignment.findByPk(assignmentId);

  if (!assignment) throw new Error('Assignment not found');

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  await File.destroy({
    where: {
      id: fileId,
      entity: 'assignment',
      entity_id: assignmentId
    }
  });
};

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
const getAssignmentStats = async (userId, role) => {
  return repository.getStats(userId, role);
};

module.exports = {
  getAllAssignmentsWithFiles,
  getAssignmentByIdWithFiles,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  deleteAttachment,
  getAssignmentStats
};