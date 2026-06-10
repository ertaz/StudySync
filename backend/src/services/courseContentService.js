const { CourseSection, Lesson, File } = require('../models/index');

const notificationService = require('../utils/notificationService');
const enrollmentRepo = require('../repositories/enrollmentRepository');

// SECTIONS
const getSections = async (courseId) => {
  return await CourseSection.findAll({
    where: { course_id: courseId },
    include: [
      {
        model: Lesson,
        as: "lessons",
        include: [
          {
            model: File,
            as: "file",
          },
        ],
      },
    ],
    order: [
      ["position", "ASC"],
      [{ model: Lesson, as: "lessons" }, "position", "ASC"],
    ],
  });
};

const createSection = async ({ course_id, title, created_by }) => {
  if (!title) throw { status: 400, message: "Title required" };

  return await CourseSection.create({
    course_id,
    title,
    created_by,
  });
};

const updateSection = async (id, body, user) => {
  return await CourseSection.update(
    {
      title: body.title,
      updated_by: user.id,
    },
    { where: { id } }
  );
};

const deleteSection = async (id) => {
 
  await Lesson.destroy({ where: { section_id: id } });

  
  return await CourseSection.destroy({ where: { id } });
};

// LESSONS
const createLesson = async ({ section_id, title, description, file, created_by }) => {
  let fileRecord = null;

  if (file) {
    fileRecord = await File.create({
      entity: "lesson",
      entity_id: 0,
      filename: file.originalname,
      file_path: `uploads/lessons/${file.filename}`,
      file_size: file.size,
      uploaded_by: created_by,
    });
  }

  const lesson = await Lesson.create({
    section_id,
    title,
    description,
    file_id: fileRecord ? fileRecord.id : null,
    created_by,
  });

  // fix entity_id now (optional cleanup)
  if (fileRecord) {
    fileRecord.entity_id = lesson.id;
    await fileRecord.save();
  }

  // Notify enrolled students
  const section = await CourseSection.findByPk(section_id);
  if (section) {
    const enrollments = await enrollmentRepo.findByCourse(section.course_id);
    for (const e of enrollments) {
      await notificationService.send(
        e.user_id,
        'lesson',
        `New Lesson: ${title}`,
        description || 'A new lesson has been added.'
      );
    }
  }

  return lesson;
};

const updateLesson = async (id, body, file, user) => {
  const lesson = await Lesson.findByPk(id);

  if (!lesson) throw new Error("Lesson not found");

  let fileId = lesson.file_id;

  // if new file uploaded
  if (file) {
    const newFile = await File.create({
      entity: "lesson",
      entity_id: id,
      filename: file.originalname,
    
    file_path: `uploads/lessons/${file.filename}`,

    file_size: file.size,
    uploaded_by: user.id,
  });

  fileId = newFile.id;
  }

  await Lesson.update(
    {
      title: body.title,
      description: body.description,
      file_id: fileId,
      updated_by: user.id,
    },
    { where: { id } }
  );

  return await Lesson.findByPk(id, {
    include: [{ model: File, as: "file" }],
  });
};

const deleteLesson = async (id) => {
  return await Lesson.destroy({ where: { id } });
};

module.exports = {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  createLesson,
  updateLesson,
  deleteLesson,
};