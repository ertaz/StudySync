const service =
require("../services/submissionService");

const getAll = async (req, res) => {
  try {

    const data =
    await service.getAllSubmissions();

    res.json({
      success: true,
      data,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

const getOne = async (req, res) => {

  try {

    const data =
    await service.getSubmissionById(
      req.params.id
    );

    res.json({
      success: true,
      data,
    });

  } catch (err) {

    res.status(404).json({
      success: false,
      message: err.message,
    });

  }
};

const getByAssignment =
async (req, res) => {

  const data =
  await service.getSubmissionsByAssignment(
    req.params.assignmentId
  );

  res.json({
    success: true,
    data,
  });

};

const getByUser =
async (req, res) => {

  const data =
  await service.getSubmissionsByUser(
    req.params.userId
  );

  res.json({
    success: true,
    data,
  });

};

const create =
async (req, res) => {

  try {

    const submission =
    await service.createSubmission({

      assignment_id:
      req.body.assignment_id,

      user_id:
      req.user.id,

      file:
      req.file || null,

      created_by:
      req.user.id,

    });

    res.status(201).json({
      success: true,
      data: submission,
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message,
    });

  }
};

const update =
async (req, res) => {

  await service.updateSubmission(
    req.params.id,
    {
      grade: req.body.grade,
      feedback: req.body.feedback,
      updated_by: req.user.id,
    }
  );

  res.json({
    success: true,
    message:
    "Submission updated",
  });
};

const remove =
async (req, res) => {

  await service.deleteSubmission(
    req.params.id
  );

  res.json({
    success: true,
    message:
    "Submission deleted",
  });
};

module.exports = {
  getAll,
  getOne,
  getByAssignment,
  getByUser,
  create,
  update,
  remove,
};