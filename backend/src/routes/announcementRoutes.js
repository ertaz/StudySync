const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const {
  getAnnouncementsByCourse,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ ok: true });
});

// GET by course
router.get("/course/:courseId", authenticate, getAnnouncementsByCourse);

// CREATE
router.post("/", authenticate, authorize("admin", "professor"), createAnnouncement);

// UPDATE
router.put("/:id", authenticate, authorize("admin", "professor"), updateAnnouncement);

// DELETE
router.delete("/:id", authenticate, authorize("admin", "professor"), deleteAnnouncement);

module.exports = router;