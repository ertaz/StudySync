const { Announcement } = require("../models");
const { createAuditLog } = require("../repositories/authRepository");
const notificationService = require('../utils/notificationService');
const enrollmentRepo = require('../repositories/enrollmentRepository');

// GET by course
const getAnnouncementsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const announcements = await Announcement.findAll({
      where: { course_id: courseId },
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, course_id } = req.body;
    const created_by = req.user.id;

    const newAnnouncement = await Announcement.create({
      title,
      content,
      course_id,
      created_by,
    });

    // Audit Logs
    await createAuditLog({
      user_id: created_by,
      action: "CREATE_ANNOUNCEMENT",
      entity: "Announcement",
      entity_id: newAnnouncement.id,
      old_value: null,
      new_value: JSON.stringify({ title, content, course_id }),
      ip_address: req.ip,
    });

    const enrollments = await enrollmentRepo.findByCourse(course_id);
for (const e of enrollments) {
  await notificationService.send(
    e.user_id,
    'announcement',
    `New Announcement: ${title}`,
    content
  );
}

    res.json({ success: true, data: newAnnouncement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Not found." });
    }

    await announcement.update({ title, content, updated_by: req.user.id });

    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // Capture before deleting
    const existing = await Announcement.findByPk(id);

    await Announcement.destroy({ where: { id } });

    // Audit Logs
    await createAuditLog({
      user_id: req.user.id,
      action: "DELETE_ANNOUNCEMENT",
      entity: "Announcement",
      entity_id: Number(id),
      old_value: existing
        ? JSON.stringify({
            title: existing.title,
            content: existing.content,
            course_id: existing.course_id,
          })
        : null,
      new_value: null,
      ip_address: req.ip,
    });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnnouncementsByCourse,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};