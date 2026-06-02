const Assignment = require('../models/sql/Assignment');
const File = require('../models/sql/File');
const fileRepository = require('../repositories/fileRepository');
const repository = require('../repositories/assignmentRepository');

const getAllAssignmentsWithFiles = async (userId, role, filters = {}) => {
  let assignments;

  if (role === 'professor') {
    assignments = await repository.getByProfessor(userId, filters);
  } else if (role === 'student') {
    assignments = await repository.getByEnrolledStudent(userId, filters);
  } else {
    assignments = await repository.getAll(filters);
  }

  const result = await Promise.all(
    assignments.map(async (a) => {
      const files = await fileRepository.getByEntity('assignment', a.id);
      return { ...a.toJSON(), attachments: files };
    })
  );

  return result;
};

const getAssignmentByIdWithFiles = async (id) => {
  const assignment = await Assignment.findByPk(id);
  if (!assignment) throw new Error('Assignment not found');

  const files = await fileRepository.getByEntity('assignment', id);
  return { ...assignment.toJSON(), attachments: files };
};

const createAssignment = async (data, userId, files = []) => {
  const assignment = await Assignment.create({
    ...data,
    created_by: userId
  });

  if (files.length > 0) {
    await Promise.all(
      files.map((file) =>
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

const updateAssignment = async (id, data, userId, files = []) => {
  const assignment = await Assignment.findByPk(id);
  if (!assignment) throw new Error('Assignment not found');

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized: you can only edit your own assignments');
  }

  await Assignment.update(
    { ...data, updated_by: userId },
    { where: { id } }
  );

  if (files.length > 0) {
    await Promise.all(
      files.map((file) =>
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

const deleteAssignment = async (id, userId) => {
  const assignment = await Assignment.findByPk(id);
  if (!assignment) throw new Error('Assignment not found');

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized: you can only delete your own assignments');
  }

  await File.destroy({ where: { entity: 'assignment', entity_id: id } });
  await assignment.destroy();
};

const deleteAttachment = async (assignmentId, fileId, userId) => {
  const assignment = await Assignment.findByPk(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  await File.destroy({ where: { id: fileId, entity: 'assignment', entity_id: assignmentId } });
};

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
