const Enrollment = require('../models/sql/Enrollment');
const Course     = require('../models/sql/Course');
const Category   = require('../models/sql/Category');
const File       = require('../models/sql/File');

const findByUserAndCourse = (user_id, course_id) =>
  Enrollment.findOne({ where: { user_id, course_id } });

const findAllByUser = (user_id) =>
  Enrollment.findAll({
    where: { user_id },
    include: [
      {
        model: Course,
        as: 'course',
        include: [
          { model: Category, as: 'category',  attributes: ['id', 'name'] },
          { model: File,     as: 'thumbnail', attributes: ['id', 'file_path', 'filename'] },
        ],
      },
    ],
    order: [['enrolled_at', 'DESC']],
  });

const create = (data) => Enrollment.create(data);

const countByCourse = (course_id) =>
  Enrollment.count({ where: { course_id } });


const countByUser = (user_id) =>
  Enrollment.count({ where: { user_id } });


const findByCourse = (course_id) =>
  Enrollment.findAll({ where: { course_id } });

module.exports = { findByUserAndCourse, findAllByUser, create, countByCourse, countByUser, findByCourse };