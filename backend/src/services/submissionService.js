const repository     = require('../repositories/submissionRepository');
const File           = require('../models/sql/File');
const SubmissionFile = require('../models/sql/SubmissionFile');
const Submission     = require('../models/sql/Submission');
const Assignment     = require('../models/sql/Assignment');
const Enrollment     = require('../models/sql/Enrollment');

const getAllSubmissions         = (query = {}) => repository.getAll(query);
const getSubmissionById        = (id)         => repository.findById(id);
const getSubmissionsByAssignment = (id, query = {}) => repository.getByAssignment(id, query);
const getSubmissionsByUser     = (id)         => repository.getByUser(id);

// ✅ Student sheh submission e tij (null nëse nuk ka dorëzuar)
const getMySubmission = (assignmentId, userId) =>
  repository.findExistingSubmission(assignmentId, userId).then((sub) => {
    if (!sub) return null;
    return repository.findById(sub.id);
  });

// ─────────────────────────────────────────────
// CREATE  (multi-file)
// ─────────────────────────────────────────────
const createSubmission = async ({ assignment_id, user_id, files, created_by }) => {
  const assignment = await Assignment.findByPk(assignment_id);
  if (!assignment) throw new Error('Assignment not found');

  const enrolled = await Enrollment.findOne({
    where: { user_id, course_id: assignment.course_id },
  });
  if (!enrolled) throw new Error('You are not enrolled in this course');

  const existing = await repository.findExistingSubmission(assignment_id, user_id);
  if (existing) throw new Error('You have already submitted this assignment');

  const now    = new Date();
  const isLate = assignment.deadline && now > new Date(assignment.deadline) ? 1 : 0;

  const submission = await Submission.create({
    assignment_id,
    user_id,
    submitted_at: now,
    is_late:      isLate,
    created_by,
  });

  if (files && files.length > 0) {
    for (const file of files) {
      const fileRecord = await File.create({
        entity:      'submission',
        entity_id:   submission.id,
        filename:    file.originalname,
        file_path:   `uploads/submissions/${file.filename}`,
        file_size:   file.size,
        uploaded_by: created_by,
      });
      await SubmissionFile.create({
        submission_id: submission.id,
        file_id:       fileRecord.id,
      });
    }
  }

  return repository.findById(submission.id);
};

// ✅ Student shton file të reja tek submission ekzistuese
const addFilesToSubmission = async ({ submissionId, userId, files }) => {
  const submission = await repository.findById(submissionId);
  if (!submission) throw new Error('Submission not found');
  if (submission.user_id !== userId) throw new Error('Not authorized');

  if (files && files.length > 0) {
    for (const file of files) {
      const fileRecord = await File.create({
        entity:      'submission',
        entity_id:   submission.id,
        filename:    file.originalname,
        file_path:   `uploads/submissions/${file.filename}`,
        file_size:   file.size,
        uploaded_by: userId,
      });
      await SubmissionFile.create({
        submission_id: submission.id,
        file_id:       fileRecord.id,
      });
    }
  }

  return repository.findById(submission.id);
};

// ✅ Student fshin një file të vetme nga submission e tij
const removeFileFromSubmission = async ({ fileId, userId }) => {
  const submissionFile = await SubmissionFile.findByPk(fileId, {
    include: [{ model: require('../models/sql/Submission'), as: 'submission' }],
  });
  if (!submissionFile) throw new Error('File not found');
  if (submissionFile.submission.user_id !== userId) throw new Error('Not authorized');

  await File.destroy({ where: { id: submissionFile.file_id } });
  await submissionFile.destroy();
};

const updateSubmission   = (id, data) => repository.update(id, data);
const deleteSubmission   = (id)       => repository.destroy(id);

module.exports = {
  getAllSubmissions,
  getSubmissionById,
  getSubmissionsByAssignment,
  getSubmissionsByUser,
  getMySubmission,
  createSubmission,
  addFilesToSubmission,
  removeFileFromSubmission,
  updateSubmission,
  deleteSubmission,
};