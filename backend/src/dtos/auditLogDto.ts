export interface AuditLogItemDto {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  action: string;
  targetTable: string;
  targetId: number;
  metadata: unknown;
  createdAt: string | null;
}

export interface AuditLogPageDto {
  items: AuditLogItemDto[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}