const repository =
  require('../repositories/courseFeedbackRepository');

const Course =
  require('../models/sql/Course');

const Enrollment =
  require('../models/sql/Enrollment');

class CourseFeedbackService {

  async createFeedback(
    courseId,
    studentId,
    rating,
    comment
  ) {

    const course =
      await Course.findByPk(courseId);

    if (!course) {
      throw {
        status: 404,
        message: 'Course not found.',
      };
    }

    const enrollment =
      await Enrollment.findOne({
        where: {
          course_id: courseId,
          user_id: studentId,
        },
      });

    if (!enrollment) {
      throw {
        status: 403,
        message:
          'You must be enrolled in this course before submitting feedback.',
      };
    }

    const existing =
      await repository.findStudentFeedback(
        courseId,
        studentId
      );

    if (existing) {
      throw {
        status: 400,
        message:
          'You have already submitted feedback for this course.',
      };
    }

    return repository.create({
      course_id: courseId,
      student_id: studentId,
      rating,
      comment,
    });
  }

  async getAll() {
    return repository.getAll();
  }

  async getByCourse(courseId) {
    return repository.getByCourse(courseId);
  }

  async markReviewed(id) {
    const feedback =
      await repository.markReviewed(id);

    if (!feedback) {
      throw {
        status: 404,
        message: 'Feedback not found.',
      };
    }

    return feedback;
  }

  async deleteFeedback(id) {
    const deleted =
      await repository.delete(id);

    if (!deleted) {
      throw {
        status: 404,
        message: 'Feedback not found.',
      };
    }

    return true;
  }
}

module.exports =
  new CourseFeedbackService();