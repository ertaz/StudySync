const chatRepo = require('../repositories/chatRepository');
const enrollmentRepo = require('../repositories/enrollmentRepository');
const courseRepo = require('../repositories/courseRepository');

// GET /api/chat/:courseId/history
const getHistory = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const userId   = req.user.id;
    const userRole = req.user.role; // 'admin', 'student', 'professor'

    // Access check: admin can always see, student must be enrolled
    if (userRole === 'student') {
      const enrolled = await enrollmentRepo.findByUserAndCourse(userId, courseId);
      if (!enrolled) {
        return res.status(403).json({ success: false, message: 'You are not enrolled in this course.' });
      }
    }

    // Professor check — only assigned professor
    // TO THIS:
      if (userRole === 'professor') {
        return res.status(403).json({ success: false, message: 'Professors do not have access to the student chat.' });
      }

    const messages = await chatRepo.getMessagesByCourse(courseId);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getHistory };