const CourseFeedback =
  require('../models/sql/CourseFeedback');

const Course =
  require('../models/sql/Course');

const User =
  require('../models/sql/User');

class CourseFeedbackRepository {

  async create(data) {
    return CourseFeedback.create(data);
  }

  async findById(id) {
    return CourseFeedback.findByPk(id);
  }

  async findStudentFeedback(courseId, studentId) {
    return CourseFeedback.findOne({
      where: {
        course_id: courseId,
        student_id: studentId,
      },
    });
  }

  async getAll() {
    return CourseFeedback.findAll({
      include: [
        {
          model: Course,
          as: 'course',
          attributes: [
            'id',
            'title'
          ]
        },
        {
          model: User,
          as: 'student',
          attributes: [
            'id',
            'first_name',
            'last_name',
            'email'
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async getByCourse(courseId) {
    return CourseFeedback.findAll({
      where: {
        course_id: courseId,
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: [
            'id',
            'first_name',
            'last_name',
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async markReviewed(id) {
    const feedback =
      await CourseFeedback.findByPk(id);

    if (!feedback) return null;

    feedback.status = 'reviewed';

    await feedback.save();

    return feedback;
  }

  async delete(id) {
    return CourseFeedback.destroy({
      where: { id },
    });
  }
}

module.exports =
  new CourseFeedbackRepository();