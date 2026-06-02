const service = require('../services/courseContentService');


// SECTIONS
exports.getSections = async (req, res) => {
  const data = await service.getSections(req.params.courseId);
  res.json(data);
};

exports.createSection = async (req, res) => {
    try {
      const data = await service.createSection({
        course_id: req.body.course_id,
        title: req.body.title,
        created_by: req.user.id,   
      });
  
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(err.status || 500).json({
        message: err.message || "Error creating section",
      });
    }
  };

exports.updateSection = async (req, res) => {
  const data = await service.updateSection(req.params.id, req.body, req.user);
  res.json(data);
};

exports.deleteSection = async (req, res) => {
  try {
    await service.deleteSection(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message || "Error deleting section",
    });
  }
};

// LESSONS
exports.createLesson = async (req, res) => {
  try {
    const data = await service.createLesson({
      section_id: req.body.section_id,
      title: req.body.title,
      description: req.body.description,
      file: req.file,
      created_by: req.user.id,
    });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating lesson" });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const data = await service.updateLesson(
      req.params.id,
      req.body,
      req.file,
      req.user
    );

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating lesson" });
  }
};

exports.deleteLesson = async (req, res) => {
  await service.deleteLesson(req.params.id, req.user);
  res.json({ success: true });
};
