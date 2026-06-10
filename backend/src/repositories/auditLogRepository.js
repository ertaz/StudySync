// repositories/auditLogRepository.js

const { AuditLog, User } = require('../models');

const getAllAuditLogs = async () => {
  return AuditLog.findAll({
    include: [
      {
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email'],
      },
    ],
    order: [['created_at', 'DESC']],
  });
};

module.exports = {
  getAllAuditLogs,
};