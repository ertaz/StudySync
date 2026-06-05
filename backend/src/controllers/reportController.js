const service = require('../services/reportService');

// ─────────────────────────────────────────────
// GET FILTER OPTIONS
// GET /api/reports/filters
// ─────────────────────────────────────────────
const getFilters = async (req, res) => {
  try {
    const data = await service.getFilterOptions();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET FULL REPORT DATA
// GET /api/reports?professorId=&courseId=&dateFrom=&dateTo=
// ─────────────────────────────────────────────
const getReport = async (req, res) => {
  try {
    const filters = {
      professorId: req.query.professorId ? parseInt(req.query.professorId) : null,
      courseId:    req.query.courseId    ? parseInt(req.query.courseId)    : null,
      dateFrom:    req.query.dateFrom    || null,
      dateTo:      req.query.dateTo      || null,
    };

    // ✅ professor sheh vetëm kurset e tij — pavarësisht çfarë dërgon fronti
    if (req.user.role === 'professor') {
      filters.professorId = req.user.id;
    }

    const data = await service.getReportData(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET COURSE DETAIL (pie + submission table)
// GET /api/reports/courses/:courseId?sectionId=&assignmentId=&dateFrom=&dateTo=
// ─────────────────────────────────────────────
const getCourseDetail = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const filters  = {
      sectionId:    req.query.sectionId    ? parseInt(req.query.sectionId)    : null,
      assignmentId: req.query.assignmentId ? parseInt(req.query.assignmentId) : null,
      dateFrom:     req.query.dateFrom     || null,
      dateTo:       req.query.dateTo       || null,
    };

    // ✅ professor nuk mund të shohë detail të kursit të profesorit tjetër
    if (req.user.role === 'professor') {
      const belongs = await service.coursebelongsToProfessor(courseId, req.user.id);
      if (!belongs) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this course.' });
      }
    }

    const data = await service.getCourseDetail(courseId, filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// EXPORT FULL REPORT
// GET /api/reports/export?format=csv|excel|json&professorId=&courseId=&dateFrom=&dateTo=
// ─────────────────────────────────────────────
const exportReport = async (req, res) => {
  try {
    const format  = (req.query.format || 'csv').toLowerCase();
    const filters = {
      professorId: req.query.professorId ? parseInt(req.query.professorId) : null,
      courseId:    req.query.courseId    ? parseInt(req.query.courseId)    : null,
      dateFrom:    req.query.dateFrom    || null,
      dateTo:      req.query.dateTo      || null,
    };

    // ✅ professor eksporton vetëm kurset e tij
    if (req.user.role === 'professor') {
      filters.professorId = req.user.id;
    }

    await service.exportFullReport(filters, format, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// EXPORT COURSE SUBMISSION TABLE
// GET /api/reports/courses/:courseId/export?format=csv|excel|json&sectionId=&assignmentId=&dateFrom=&dateTo=
// ─────────────────────────────────────────────
const exportCourseTable = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const format   = (req.query.format || 'csv').toLowerCase();
    const filters  = {
      sectionId:    req.query.sectionId    ? parseInt(req.query.sectionId)    : null,
      assignmentId: req.query.assignmentId ? parseInt(req.query.assignmentId) : null,
      dateFrom:     req.query.dateFrom     || null,
      dateTo:       req.query.dateTo       || null,
    };

    // ✅ professor nuk mund të eksportojë kursin e profesorit tjetër
    if (req.user.role === 'professor') {
      const belongs = await service.coursebelongsToProfessor(courseId, req.user.id);
      if (!belongs) {
        return res.status(403).json({ success: false, message: 'You do not have permission to export this course.' });
      }
    }

    await service.exportCourseTable(courseId, filters, format, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFilters,
  getReport,
  getCourseDetail,
  exportReport,
  exportCourseTable,
};