const { Announcement } = require("../models");

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
    await Announcement.destroy({ where: { id } });
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