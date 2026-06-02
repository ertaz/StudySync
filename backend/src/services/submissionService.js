const repository =
require("../repositories/submissionRepository");

const File =
require("../models/sql/File");

const Submission =
require("../models/sql/Submission");

const getAllSubmissions =
() => repository.getAll();

const getSubmissionById =
(id) => repository.findById(id);

const getSubmissionsByAssignment =
(id) => repository.getByAssignment(id);

const getSubmissionsByUser =
(id) => repository.getByUser(id);

const createSubmission = async ({
  assignment_id,
  user_id,
  file,
  created_by,
}) => {

  let fileRecord = null;

  if (file) {

    fileRecord = await File.create({
      entity: "submission",
      entity_id: 0,
      filename: file.originalname,
      file_path:
      `uploads/submissions/${file.filename}`,
      file_size: file.size,
      uploaded_by: created_by,
    });

  }

  const submission =
  await Submission.create({
    assignment_id,
    user_id,
    file_id:
      fileRecord
      ? fileRecord.id
      : null,

    created_by,
  });

  if (fileRecord) {

    fileRecord.entity_id =
      submission.id;

    await fileRecord.save();

  }

  return submission;
};

const updateSubmission =
(id, data) =>
repository.update(id, data);

const deleteSubmission =
(id) =>
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