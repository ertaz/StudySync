const repository = require('../repositories/assignmentRepository');
const Assignment = require('../models/sql/Assignment');
const File = require('../models/sql/File');
const Submission = require('../models/sql/Submission');
const Enrollment = require('../models/sql/Enrollment');
const CourseSection = require('../models/sql/CourseSection');

const fileRepository = require('../repositories/fileRepository');
const fs = require('fs');
const path = require('path');

const notificationService = require('../utils/notificationService');
const enrollmentRepo = require('../repositories/enrollmentRepository');

// ─────────────────────────────────────────────
// GET ALL WITH FILES
// ─────────────────────────────────────────────
const getAllAssignmentsWithFiles = async (userId, role, filters = {}) => {
  const assignments = await repository.getAll(filters, userId, role);

  return Promise.all(
    assignments.map(async (a) => {
      const files = await fileRepository.getByEntity('assignment', a.id);
      return { ...a.toJSON(), attachments: files };
    })
  );
};

// ─────────────────────────────────────────────
// GET BY ID SECURE
// ─────────────────────────────────────────────
const getAssignmentByIdSecure = async (id, userId, role) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  // professor only own
  if (role === 'professor' && assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  // student check enrollment
  if (role === 'student') {
    const enrollment = await Enrollment.findOne({
      where: {
        user_id: userId,
        course_id: assignment.course_id
      }
    });

    if (!enrollment) {
      throw new Error('Access denied');
    }
  }

  const files = await fileRepository.getByEntity('assignment', id);
  return { ...assignment.toJSON(), attachments: files };
};

// ─────────────────────────────────────────────
// CREATE (PROFESSOR ONLY + VALIDATION)
// ─────────────────────────────────────────────
const createAssignmentSecure = async (data, userId, role, files = []) => {

  if (role !== 'professor') {
    throw new Error('Only professors can create assignments');
  }

  // deadline validation
  if (data.deadline && new Date(data.deadline) < new Date()) {
    throw new Error('Deadline cannot be in the past');
  }

  // section must exist (if provided)
  if (data.section_id) {
    const section = await CourseSection.findByPk(data.section_id);
    if (!section) throw new Error('Invalid section');
  }

  const assignment = await Assignment.create({
    ...data,
    created_by: userId
  });

  if (files.length > 0) {
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

  const attachments = await fileRepository.getByEntity('assignment', assignment.id);

  // Notify enrolled students
  const enrollments = await enrollmentRepo.findByCourse(assignment.course_id);
  for (const e of enrollments) {
    await notificationService.send(
      e.user_id,
      'assignment',
      `New Assignment: ${assignment.title}`,
      assignment.description || 'A new assignment has been posted.'
    );
  }

  return { ...assignment.toJSON(), attachments };
};

// ─────────────────────────────────────────────
// UPDATE (PROFESSOR ONLY)
// ─────────────────────────────────────────────
const updateAssignment = async (id, data, userId, role, files = []) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) throw new Error('Assignment not found');

  if (role !== 'professor' || assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  if (data.deadline && new Date(data.deadline) < new Date()) {
    throw new Error('Deadline cannot be in the past');
  }

  await Assignment.update(
    { ...data, updated_by: userId },
    { where: { id } }
  );

  if (files.length > 0) {
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
// DELETE (PROFESSOR ONLY)
// ─────────────────────────────────────────────
const deleteAssignment = async (id, userId, role) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) throw new Error('Assignment not found');

  if (role !== 'professor' || assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  await File.destroy({ where: { entity: 'assignment', entity_id: id } });
  await Submission.destroy({ where: { assignment_id: id } });

  await Assignment.destroy({ where: { id } });
};

// ─────────────────────────────────────────────
// ATTACHMENT DELETE
// ─────────────────────────────────────────────
const deleteAttachment = async (assignmentId, fileId, userId, role) => {
  const assignment = await Assignment.findByPk(assignmentId);

  if (!assignment) throw new Error('Not found');

  if (role !== 'professor' || assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  const file = await File.findByPk(fileId);

  if (!file) throw new Error('File not found');

  await File.destroy({
    where: { id: fileId, entity: 'assignment', entity_id: assignmentId }
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
  getAssignmentByIdSecure,
  createAssignmentSecure,
  updateAssignment,
  deleteAssignment,
  deleteAttachment,
  getAssignmentStats
};