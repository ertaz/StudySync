const repository = require("../repositories/submissionRepository");
const File = require("../models/sql/File");
const Submission = require("../models/sql/Submission");
const Assignment = require("../models/sql/Assignment");
const Enrollment = require("../models/sql/Enrollment");

const getAllSubmissions = () => repository.getAll();

const getSubmissionById = (id) => repository.findById(id);

const getSubmissionsByAssignment = (id) =>
  repository.getByAssignment(id);

const getSubmissionsByUser = (id) =>
  repository.getByUser(id);

/**
 * 🔥 FIXED CREATE SUBMISSION (MAIN FIX)
 */
const createSubmission = async ({
  assignment_id,
  user_id,
  file,
  created_by,
}) => {
  // 1. Check assignment exists
  const assignment = await Assignment.findByPk(assignment_id);
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // 2. Check enrollment (double safety layer)
  const enrolled = await Enrollment.findOne({
    where: {
      user_id,
      course_id: assignment.course_id,
    },
  });

  if (!enrolled) {
    throw new Error("You are not enrolled in this course");
  }

  // 3. Prevent duplicate submission
  const existing =
    await repository.findExistingSubmission(
      assignment_id,
      user_id
    );

  if (existing) {
    throw new Error(
      "You have already submitted this assignment"
    );
  }

  // 4. Check deadline
  if (
    assignment.deadline &&
    new Date() > new Date(assignment.deadline)
  ) {
    throw new Error("Deadline has passed");
  }

  // 5. Create submission FIRST
  const submission = await Submission.create({
    assignment_id,
    user_id,
    file_id: null,
    created_by,
  });

  // 6. Handle file AFTER submission exists (FIXED)
  if (file) {
    const fileRecord = await File.create({
      entity: "submission",
      entity_id: submission.id,
      filename: file.originalname,
      file_path: `uploads/submissions/${file.filename}`,
      file_size: file.size,
      uploaded_by: created_by,
    });

    submission.file_id = fileRecord.id;
    await submission.save();
  }

  return submission;
};

const updateSubmission = (id, data) =>
  repository.update(id, data);

const deleteSubmission = (id) =>
  repository.destroy(id);

module.exports = {
  getAllSubmissions,
  getSubmissionById,
  getSubmissionsByAssignment,
  getSubmissionsByUser,
  createSubmission,
  updateSubmission,
  deleteSubmission,
};