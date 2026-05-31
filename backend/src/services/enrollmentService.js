const enrollmentRepo = require('../repositories/enrollmentRepository');
const courseRepo     = require('../repositories/courseRepository');

const enrollStudent = async (userId, courseId) => {
  // 1. Make sure course exists
  const course = await courseRepo.findById(courseId);
  if (!course) throw { status: 404, message: 'Course not found.' };

  // 2. Prevent duplicate enrollment
  const existing = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (existing) throw { status: 409, message: 'You are already enrolled in this course.' };

  // 3. Create enrollment
  const enrollment = await enrollmentRepo.create({
    user_id:    userId,
    course_id:  courseId,
    enrolled_at: new Date(),
    created_by: userId,
    updated_by: userId,
  });

  return enrollment;
};

const getMyEnrollments = async (userId) => {
  return enrollmentRepo.findAllByUser(userId);
};

const checkEnrollment = async (userId, courseId) => {
  const record = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  return !!record;
};

module.exports = { enrollStudent, getMyEnrollments, checkEnrollment };