import { api } from './client';
import type { AuditLog, AuditPagination } from '../types';

export interface AuditQuery {
  page?: number;
  pageSize?: number;
  targetId?: string | number;
  userId?: string | number;
  action?: string;
}

export async function listAuditLogs(query: AuditQuery): Promise<{ items: AuditLog[]; pagination: AuditPagination }> {
  const res = await api.get<{ data: { items: AuditLog[]; pagination: AuditPagination } }>('/audit-logs', { params: query });
  return res.data.data;
}

export async function getAuditLog(id: number): Promise<AuditLog> {
  const res = await api.get<{ data: AuditLog }>(`/audit-logs/${id}`);
  return res.data.data;
}