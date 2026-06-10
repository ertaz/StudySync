const enrollmentRepo = require('../repositories/enrollmentRepository');
const courseRepo     = require('../repositories/courseRepository');
const settingRepo    = require('../repositories/settingRepository');
const notificationService = require('../utils/notificationService');
const { createAuditLog } = require('../repositories/authRepository');

const enrollStudent = async (userId, courseId, ip) => {
  const allowEnrollment = await settingRepo.getByKey('allow_enrollment');
if (allowEnrollment && allowEnrollment.value === 'false') {
  throw { status: 403, message: 'Enrollments are currently disabled by the administrator.' };
}

  const course = await courseRepo.findById(courseId);
  if (!course) throw { status: 404, message: 'Course not found.' };

  const existing = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (existing) throw { status: 409, message: 'You are already enrolled in this course.' };

  
  const maxPerCourse = await settingRepo.getByKey('max_enrollment_per_course');
  if (maxPerCourse) {
    const enrollmentCount = await enrollmentRepo.countByCourse(courseId);
    if (enrollmentCount >= Number(maxPerCourse.value)) {
      throw { status: 403, message: 'This course has reached its maximum enrollment capacity.' };
    }
  }

  
  const maxPerStudent = await settingRepo.getByKey('max_courses_per_student');
  if (maxPerStudent) {
    const studentEnrollments = await enrollmentRepo.countByUser(userId);
    if (studentEnrollments >= Number(maxPerStudent.value)) {
      throw { status: 403, message: 'You have reached the maximum number of courses you can enroll in.' };
    }
  }

  const enrollment = await enrollmentRepo.create({
    user_id:     userId,
    course_id:   courseId,
    enrolled_at: new Date(),
    created_by:  userId,
    updated_by:  userId,
  });

  await createAuditLog({
    user_id:    userId,
    action:     'ENROLL_COURSE',
    entity:     'Enrollment',
    entity_id:  enrollment.id,
    old_value:  null,
    new_value:  JSON.stringify({ course_id: courseId }),
    ip_address: ip,
  });
 
  await notificationService.send(
  userId,
  'enrollment',
  'Enrollment Successful',
  `You have successfully enrolled in "${course.title}".`
);

  return enrollment;
};

const getMyEnrollments = async (userId) => enrollmentRepo.findAllByUser(userId);

const checkEnrollment = async (userId, courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw { status: 404, message: 'Course not found.' };

  if (course.professor_id === userId) return true;

  const record = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  return !!record;
};

module.exports = { enrollStudent, getMyEnrollments, checkEnrollment };