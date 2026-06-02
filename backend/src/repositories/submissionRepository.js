const Submission = require("../models/sql/Submission");
const Assignment = require("../models/sql/Assignment");
const User = require("../models/sql/User");
const File = require("../models/sql/File");

const getAll = () =>
  Submission.findAll({
    include: [
      {
        model: Assignment,
        as: "assignment",
      },
      {
        model: User,
        as: "student",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email",
        ],
      },
      {
        model: File,
        as: "file",
      },
    ],
    order: [["created_at", "DESC"]],
  });

const findById = (id) =>
  Submission.findByPk(id, {
    include: [
      "assignment",
      "student",
      "file",
    ],
  });

const getByAssignment = (assignmentId) =>
  Submission.findAll({
    where: {
      assignment_id: assignmentId,
    },
    include: [
      "student",
      "file",
    ],
  });

const getByUser = (userId) =>
  Submission.findAll({
    where: {
      user_id: userId,
    },
    include: [
      "assignment",
      "file",
    ],
  });

const create = (data) =>
  Submission.create(data);

const update = (id, data) =>
  Submission.update(
    data,
    {
      where: { id },
    }
  );

const destroy = (id) =>
  Submission.destroy({
    where: { id },
  });

module.exports = {
  getAll,
  findById,
  getByAssignment,
  getByUser,
  create,
  update,
  destroy,
};