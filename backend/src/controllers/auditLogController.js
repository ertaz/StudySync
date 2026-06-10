// controllers/auditLogController.js

const auditService = require('../services/auditLogService');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await auditService.getAuditLogs();

    res.json(logs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
};