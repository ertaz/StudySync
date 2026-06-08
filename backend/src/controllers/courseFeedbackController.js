const service =
  require('../services/courseFeedbackService');

const AuditLog =
  require('../models/sql/AuditLog');

const create = async (req, res) => {
  try {

    const {
      course_id,
      rating,
      comment,
    } = req.body;

    const feedback =
      await service.createFeedback(
        course_id,
        req.user.id,
        rating,
        comment
      );

    await AuditLog.create({
      user_id: req.user.id,
      action: 'SUBMIT_FEEDBACK',
      entity: 'CourseFeedback',
      entity_id: feedback.id,
      ip_address: req.ip,
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAll = async (req, res) => {
  try {

    const feedback =
      await service.getAll();

    res.json({
      success: true,
      data: feedback,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getByCourse = async (req, res) => {
  try {

    const feedback =
      await service.getByCourse(
        req.params.courseId
      );

    res.json({
      success: true,
      data: feedback,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const markReviewed = async (req, res) => {
  try {

    const feedback =
      await service.markReviewed(
        req.params.id
      );

    await AuditLog.create({
      user_id: req.user.id,
      action: 'MARK_FEEDBACK_REVIEWED',
      entity: 'CourseFeedback',
      entity_id: feedback.id,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      data: feedback,
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const remove = async (req, res) => {
  try {

    await service.deleteFeedback(
      req.params.id
    );

    await AuditLog.create({
      user_id: req.user.id,
      action: 'DELETE_FEEDBACK',
      entity: 'CourseFeedback',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message:
        'Feedback deleted successfully.',
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  create,
  getAll,
  getByCourse,
  markReviewed,
  remove,
};