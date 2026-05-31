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

const createCourse = async ({ title, description, category_id, professor_id, uploadedFile, userId }) => {
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
    category_id:       category_id  || null,
    professor_id:      professor_id || null,   // ← NEW
    thumbnail_file_id,
    created_by:        userId,
    updated_by:        userId,
  });

  if (thumbnail_file_id) {
    await FileModel.update({ entity_id: course.id }, { where: { id: thumbnail_file_id } });
  }

  return courseRepo.findById(course.id);
};

const updateCourse = async ({ id, title, description, category_id, professor_id, uploadedFile, userId }) => {
  const course = await courseRepo.findById(id);
  if (!course) throw { status: 404, message: 'Course not found' };

  let thumbnail_file_id = course.thumbnail_file_id;

  if (uploadedFile) {
    if (course.thumbnail?.file_path) {
      const oldPath = path.join(__dirname, '../../', course.thumbnail.file_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    if (course.thumbnail_file_id) {
      await fileRepo.deleteFile(course.thumbnail_file_id);
    }
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

  await courseRepo.update(id, {
    title,
    description,
    category_id:       category_id  || null,
    professor_id:      professor_id || null,  
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