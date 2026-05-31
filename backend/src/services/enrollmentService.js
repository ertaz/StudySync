const enrollmentRepo = require('../repositories/enrollmentRepository');
const courseRepo     = require('../repositories/courseRepository');

const enrollStudent = async (userId, courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw { status: 404, message: 'Course not found.' };

  const existing = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (existing) throw { status: 409, message: 'You are already enrolled in this course.' };

  return enrollmentRepo.create({
    user_id:     userId,
    course_id:   courseId,
    enrolled_at: new Date(),
    created_by:  userId,
    updated_by:  userId,
  });
};

const getMyEnrollments = async (userId) => enrollmentRepo.findAllByUser(userId);

// ← Returns true if enrolled OR if the user is the assigned professor
const checkEnrollment = async (userId, courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw { status: 404, message: 'Course not found.' };

  // Professor of this course always has access
  if (course.professor_id === userId) return true;

  const record = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  return !!record;
};

module.exports = { enrollStudent, getMyEnrollments, checkEnrollment };