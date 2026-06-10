// src/api/auditLogApi.ts

import api from './axiosInstance';

export async function fetchAuditLogs() {
  const res = await api.get('/audit-logs');
  return res.data;
}