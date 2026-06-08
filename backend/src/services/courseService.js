const path       = require('path');
const fs         = require('fs');
const courseRepo = require('../repositories/courseRepository');
const fileRepo   = require('../repositories/fileRepository');
const FileModel  = require('../models/sql/File');
const settingRepo = require('../repositories/settingRepository');
const { createAuditLog } = require('../repositories/authRepository');

const getAllCourses = () => courseRepo.getAll();

const getCourseById = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw { status: 404, message: 'Course not found' };
  return course;
};

const createCourse = async ({ title, description, category_id, professor_id, uploadedFile, userId, ip }) => {
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

  const maxPerCategory = await settingRepo.getByKey('max_courses_per_category');
  if (maxPerCategory) {
    const categoryCount = await courseRepo.countByCategory(category_id);
    if (categoryCount >= Number(maxPerCategory.value)) {
      throw { status: 403, message: 'This category has reached its maximum number of courses.' };
    }
  }

  const course = await courseRepo.create({
    title,
    description,
    category_id:       category_id  || null,
    professor_id:      professor_id || null,
    thumbnail_file_id,
    created_by:        userId,
    updated_by:        userId,
  });

  if (thumbnail_file_id) {
    await FileModel.update({ entity_id: course.id }, { where: { id: thumbnail_file_id } });
  }

  const result = await courseRepo.findById(course.id);

  await createAuditLog({
    user_id:    userId,
    action:     'CREATE_COURSE',
    entity:     'Course',
    entity_id:  result.id,
    old_value:  null,
    new_value:  JSON.stringify({ title, description, category_id, professor_id }),
    ip_address: ip,
  });

  return result;
};

const updateCourse = async ({ id, title, description, category_id, professor_id, uploadedFile, userId, ip }) => {
  const course = await courseRepo.findById(id);
  if (!course) throw { status: 404, message: 'Course not found' };

  const oldSnapshot = JSON.stringify({
    title:        course.title,
    description:  course.description,
    category_id:  course.category_id,
    professor_id: course.professor_id,
  });

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

  await createAuditLog({
    user_id:    userId,
    action:     'UPDATE_COURSE',
    entity:     'Course',
    entity_id:  id,
    old_value:  oldSnapshot,
    new_value:  JSON.stringify({ title, description, category_id, professor_id }),
    ip_address: ip,
  });

  return courseRepo.findById(id);
};

const deleteCourse = async (id, userId, ip) => {
  const course = await courseRepo.findById(id);
  if (!course) throw { status: 404, message: 'Course not found' };

  const oldSnapshot = JSON.stringify({
    title:        course.title,
    description:  course.description,
    category_id:  course.category_id,
    professor_id: course.professor_id,
  });

  if (course.thumbnail?.file_path) {
    const fullPath = path.join(__dirname, '../../', course.thumbnail.file_path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }

  const result = await courseRepo.destroy(id);

  await createAuditLog({
    user_id:    userId,
    action:     'DELETE_COURSE',
    entity:     'Course',
    entity_id:  id,
    old_value:  oldSnapshot,
    new_value:  null,
    ip_address: ip,
  });

  return result;
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
