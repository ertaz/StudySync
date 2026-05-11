// src/controllers/courseController.js
const courseService = require('../services/courseService');

const getAll = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { title, description, category_id } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const course = await courseService.createCourse({
      title, description, category_id,
      uploadedFile: req.file || null,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { title, description, category_id } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const course = await courseService.updateCourse({
      id: req.params.id,
      title, description, category_id,
      uploadedFile: req.file || null,
      userId: req.user.id,
    });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
