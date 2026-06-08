const service = require('../services/courseNoteService');

async function uploadNote(req, res) {
  try {
    const { title, course_id } = req.body;

    if (!title || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing title or course_id',
      });
    }

    const note = await service.createNote({
      courseId: Number(course_id),
      studentId: req.user.id,
      title,
      uploadedFile: req.file,
    });

    return res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function getNotes(req, res) {
  try {
    const notes = await service.getCourseNotes(req.params.courseId);

    return res.json({
      success: true,
      data: notes,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function deleteNote(req, res) {
  try {
    await service.deleteNote(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully"
    });

  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  uploadNote,
  getNotes,
  deleteNote,
};