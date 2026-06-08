const fs = require('fs');
const path = require('path');

const repo = require('../repositories/courseNoteRepository');
const fileRepo = require('../repositories/fileRepository');

const createNote = async ({
  courseId,
  studentId,
  title,
  uploadedFile,
}) => {
  if (!uploadedFile) throw new Error('No file uploaded');

  const file = await fileRepo.createFile({
    entity: 'course_note',
    entity_id: 0,
    filename: uploadedFile.originalname,

    // ✅ FIXED PATH (IMPORTANT)
    file_path: '/uploads/course-notes/' + path.basename(uploadedFile.path),

    file_size: uploadedFile.size,
    uploaded_by: studentId,
  });

  const note = await repo.create({
    course_id: courseId,
    student_id: studentId,
    title,
    file_id: file.id,
  });

  file.entity_id = note.id;
  await file.save();

  return note;
};

const getCourseNotes = (courseId) =>
  repo.getByCourse(courseId);

const deleteNote = async (noteId, currentUser) => {
  const note = await repo.findById(noteId);

  if (!note) {
    throw { status: 404, message: 'Note not found' };
  }

  const isAdmin = currentUser.role === 'admin';
  const isOwner = note.student_id === currentUser.id;

  if (!isAdmin && !isOwner) {
    throw { status: 403, message: 'Forbidden' };
  }

  if (note.file?.file_path) {
    const fullPath = path.join(__dirname, '../../', note.file.file_path);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await fileRepo.deleteFile(note.file.id);
  }

  await repo.deleteNote(noteId);
};

module.exports = {
  createNote,
  getCourseNotes,
  deleteNote,
};