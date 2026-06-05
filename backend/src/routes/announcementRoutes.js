const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const {
  getAnnouncementsByCourse,
  createAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ ok: true });
});

// GET by course - të gjithë të loguar
router.get("/course/:courseId", authenticate, getAnnouncementsByCourse);

// CREATE - vetëm admin dhe professor
router.post("/", authenticate, authorize("admin", "professor"), createAnnouncement);

// DELETE - vetëm admin dhe professor
router.delete("/:id", authenticate, authorize("admin", "professor"), deleteAnnouncement);

module.exports = router;