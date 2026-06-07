const enrollmentRepo = require('../repositories/enrollmentRepository');
const courseRepo     = require('../repositories/courseRepository');

const enrollmentGuard = async (req, res, next) => {
  try {
    const userId   = req.user.id;
    const userRole = req.user.role; // adjust if your JWT stores role differently
    const courseId = Number(req.params.id || req.params.courseId);

    // Admins always pass
    if (userRole === 'admin') return next();

    const course = await courseRepo.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Assigned professor always passes
    if (course.professor_id === userId) return next();

    // Everyone else must be enrolled
    const enrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not enrolled in this course.',
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Enrollment check failed.' });
  }
};

module.exports = enrollmentGuard;