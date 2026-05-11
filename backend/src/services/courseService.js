// src/services/courseService.js
const path       = require('path');
const fs         = require('fs');
const courseRepo = require('../repositories/courseRepository');
const fileRepo   = require('../repositories/fileRepository');
const FileModel  = require('../models/sql/File');

const getAllCourses = () => courseRepo.getAll();

const getCourseById = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw { status: 404, message: 'Course not found' };
  return course;
};

const createCourse = async ({ title, description, category_id, uploadedFile, userId }) => {
  let thumbnail_file_id = null;

  if (uploadedFile) {
    const relativePath = 'uploads/thumbnails/' + path.basename(uploadedFile.path);
    const fileRecord = await fileRepo.createFile({
      entity:      'course',
      entity_id:   0,
      filename:    uploadedFile.originalname,
      file_path:   relativePath,
      file_size:   uploadedFile.size,
      uploaded_by: userId,
    });
    thumbnail_file_id = fileRecord.id;
  }

  const course = await courseRepo.create({
    title,
    description,
    category_id:       category_id || null,
    thumbnail_file_id,
    created_by:        userId,
    updated_by:        userId,
  });

  if (thumbnail_file_id) {
    await FileModel.update({ entity_id: course.id }, { where: { id: thumbnail_file_id } });
  }

  return courseRepo.findById(course.id);
};

const updateCourse = async ({ id, title, description, category_id, uploadedFile, userId }) => {
  const course = await courseRepo.findById(id);
  if (!course) throw { status: 404, message: 'Course not found' };

  let thumbnail_file_id = course.thumbnail_file_id;

  // If a new image was uploaded, delete the old file and insert a new Files record
  if (uploadedFile) {
    // 1. Delete old physical file from disk if it exists
    if (course.thumbnail?.file_path) {
      const oldPath = path.join(__dirname, '../../', course.thumbnail.file_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // 2. Delete old Files record
    if (course.thumbnail_file_id) {
      await fileRepo.deleteFile(course.thumbnail_file_id);
    }

    // 3. Create new Files record
    const relativePath = 'uploads/thumbnails/' + path.basename(uploadedFile.path);
    const fileRecord = await fileRepo.createFile({
      entity:      'course',
      entity_id:   id,
      filename:    uploadedFile.originalname,
      file_path:   relativePath,
      file_size:   uploadedFile.size,
      uploaded_by: userId,
    });
    thumbnail_file_id = fileRecord.id;
  }

  // Update the course row
  await courseRepo.update(id, {
    title,
    description,
    category_id:       category_id || null,
    thumbnail_file_id,
    updated_by:        userId,
  });

  return courseRepo.findById(id);
};

const deleteCourse = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw { status: 404, message: 'Course not found' };

  if (course.thumbnail?.file_path) {
    const fullPath = path.join(__dirname, '../../', course.thumbnail.file_path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }

  return courseRepo.destroy(id);
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
