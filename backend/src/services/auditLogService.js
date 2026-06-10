// services/auditLogService.js

const repo = require('../repositories/auditLogRepository');

const getAuditLogs = async () => {
  return repo.getAllAuditLogs();
};

module.exports = {
  getAuditLogs,
};