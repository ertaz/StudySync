const repository = require('../repositories/assignmentRepository');
const Assignment = require('../models/sql/Assignment');
const File = require('../models/sql/File');
const Submission = require('../models/sql/Submission');
const Enrollment = require('../models/sql/Enrollment');

const fileRepository = require('../repositories/fileRepository');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// GET ALL WITH FILES
// (pa ndryshim — funksionon mirë)
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
// GET BY ID — FIX #9
// Studenti pa enrollment nuk mund të shohë assignment
// ─────────────────────────────────────────────
const getAssignmentByIdSecure = async (id, userId, role) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  // Admin dhe profesor shohin gjithçka
  if (role === 'admin' || role === 'professor') {
    const files = await fileRepository.getByEntity('assignment', id);
    return { ...assignment.toJSON(), attachments: files };
  }

  // Studenti duhet të jetë i regjistruar në kurs
  const enrollment = await Enrollment.findOne({
    where: {
      user_id: userId,
      course_id: assignment.course_id
    }
  });

  if (!enrollment) {
    throw new Error('Access denied: you are not enrolled in this course');
  }

  const files = await fileRepository.getByEntity('assignment', id);
  return { ...assignment.toJSON(), attachments: files };
};

// ─────────────────────────────────────────────
// CREATE — FIX #10
// Profesori mund të krijojë assignment vetëm
// për kurset që i janë caktuar
// ─────────────────────────────────────────────
const createAssignmentSecure = async (data, userId, role, files = []) => {
  // Admin lejohet të krijojë për çdo kurs
  if (role !== 'admin') {
    // Kontrollo nëse profesori lidhet me këtë kurs.
    // Nëse ke tabelë CourseProfessor/CourseTeacher — përdor atë.
    // Nëse profesorët janë studentë të llojit tjetër, adapto where-in.
    const teaches = await CourseProfessor.findOne({
      where: {
        user_id: userId,
        course_id: data.course_id
      }
    });

    if (!teaches) {
      throw new Error('Unauthorized: you are not assigned to this course');
    }
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
  return { ...assignment.toJSON(), attachments };
};

// ─────────────────────────────────────────────
// UPDATE
// (pa ndryshim — created_by check ekziston)
// ─────────────────────────────────────────────
const updateAssignment = async (id, data, userId, files = []) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized');
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
// DELETE ASSIGNMENT — FIX #4 & #7
// 1. Kontrollon ownership
// 2. Fshin fajllat fizikë nga disku
// 3. Fshin File records nga DB
// 4. Fshin Submission records (cascade manual)
// 5. Fshin Assignment
// ─────────────────────────────────────────────
const deleteAssignment = async (id, userId) => {
  const assignment = await Assignment.findByPk(id);

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  // 1. Gjej të gjithë fajllat e lidhur me këtë assignment
  const attachedFiles = await File.findAll({
    where: {
      entity: 'assignment',
      entity_id: id
    }
  });

  // 2. Fshi fajllat fizikë nga disku
  for (const file of attachedFiles) {
    const filePath = path.join(__dirname, '../../', file.file_path);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      // Vazhdo edhe nëse fajlli mungon nga disku
      console.warn(`Could not delete file from disk: ${filePath}`, err.message);
    }
  }

  // 3. Gjej submissions dhe fajllat e tyre (submission files)
  const submissions = await Submission.findAll({
    where: { assignment_id: id }
  });

  for (const submission of submissions) {
    // Fshi fajllat fizikë të submission-eve
    const submissionFiles = await File.findAll({
      where: {
        entity: 'submission',
        entity_id: submission.id
      }
    });

    for (const sFile of submissionFiles) {
      const sFilePath = path.join(__dirname, '../../', sFile.file_path);
      try {
        if (fs.existsSync(sFilePath)) {
          fs.unlinkSync(sFilePath);
        }
      } catch (err) {
        console.warn(`Could not delete submission file from disk: ${sFilePath}`, err.message);
      }
    }

    // Fshi File records të submission-it
    await File.destroy({
      where: { entity: 'submission', entity_id: submission.id }
    });
  }

  // 4. Fshi të gjitha submissions të këtij assignment-i
  await Submission.destroy({
    where: { assignment_id: id }
  });

  // 5. Fshi File records të assignment-it
  await File.destroy({
    where: { entity: 'assignment', entity_id: id }
  });

  // 6. Fshi assignment-in
  await Assignment.destroy({
    where: { id }
  });
};

// ─────────────────────────────────────────────
// DELETE ATTACHMENT — FIX #6
// (tashmë i rregulluar — pa ndryshim)
// ─────────────────────────────────────────────
const deleteAttachment = async (assignmentId, fileId, userId) => {
  const assignment = await Assignment.findByPk(assignmentId);

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.created_by !== userId) {
    throw new Error('Unauthorized');
  }

  const file = await File.findByPk(fileId);

  if (!file) {
    throw new Error('File not found');
  }

  // Verifiko që fajlli i takon këtij assignment-i
  if (file.entity !== 'assignment' || String(file.entity_id) !== String(assignmentId)) {
    throw new Error('File does not belong to this assignment');
  }

  // 1. Fshi nga disku
  const filePath = path.join(__dirname, '../../', file.file_path);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Could not delete file from disk:', err.message);
  }

  // 2. Fshi nga DB
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
// (pa ndryshim — tashmë i rregulluar në repository)
// ─────────────────────────────────────────────
const getAssignmentStats = async (userId, role) => {
  return repository.getStats(userId, role);
};

module.exports = {
  getAllAssignmentsWithFiles,
  getAssignmentByIdSecure,       // FIX #9 — zëvendëson getAssignmentByIdWithFiles
  createAssignmentSecure,        // FIX #10 — zëvendëson createAssignment
  updateAssignment,
  deleteAssignment,              // FIX #4 & #7 — i ri
  deleteAttachment,
  getAssignmentStats
};
