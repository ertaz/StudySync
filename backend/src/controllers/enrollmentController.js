const enrollmentService = require('../services/enrollmentService');

const enroll = async (req, res) => {
  try {
    const userId   = req.user.id;
    const courseId = Number(req.params.courseId);

    const enrollment = await enrollmentService.enrollStudent(userId, courseId, req.ip); 
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await enrollmentService.getMyEnrollments(req.user.id);
    res.json({ success: true, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const checkEnrollment = async (req, res) => {
  try {
    const isEnrolled = await enrollmentService.checkEnrollment(
      req.user.id,
      Number(req.params.courseId)
    );
    res.json({ success: true, isEnrolled });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { enroll, getMyEnrollments, checkEnrollment };