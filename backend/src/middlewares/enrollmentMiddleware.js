const Enrollment = require('../models/sql/Enrollment');
const Assignment = require('../models/sql/Assignment');

const checkEnrolled = async (req, res, next) => {
  try {
    // Admin dhe profesor kalojnë direkt
    if (['admin', 'professor'].includes(req.user.role)) {
      return next();
    }

    const assignmentId =
      req.params.assignmentId ||
      req.params.id ||
      req.body.assignment_id;

    if (!assignmentId) {
      return next();
    }

    const assignment = await Assignment.findByPk(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const enrollment = await Enrollment.findOne({
      where: {
        user_id: req.user.id,
        course_id: assignment.course_id
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: you are not enrolled in this course'
      });
    }

    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = { checkEnrolled };