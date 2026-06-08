const { CourseNote, User, File } = require('../models');

const create = (data) => CourseNote.create(data);

const getByCourse = async (courseId) => {
  return await CourseNote.findAll({
    where: { course_id: courseId },
    include: [
      {
        model: User,
        as: 'student',
        attributes: ['id', 'first_name', 'last_name'],
      },
      {
        model: File,
        as: 'file',
      },
    ],
    order: [['created_at', 'DESC']],
  });
};

const findById = (id) =>
  CourseNote.findByPk(id, {
    include: [{ model: File, as: 'file' }],
  });

const deleteNote = (id) =>
  CourseNote.destroy({
    where: { id },
  });

module.exports = {
  create,
  getByCourse,
  findById,
  deleteNote,
};