import type { AuditLogItemDto, AuditLogPageDto } from '../dtos/auditLogDto.ts';
import { AuditLogRepository, type AuditEntry, type AuditExecutor } from '../repositories/auditLogRepository.ts';
import type { AuditLogQuery } from '../schemas/auditLogSchema.ts';

function parseMetadata(raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

export class AuditLogService {
  constructor(private readonly repo = new AuditLogRepository()) {}

  async record(entry: AuditEntry, executor?: AuditExecutor): Promise<void> {
    await this.repo.insert(entry, executor);
  }

  private toItemDto(row: Record<string, unknown>): AuditLogItemDto {
    return {
      id: Number(row.id),
      userId: Number(row.userId),
      userName: (row.userName as string | null) ?? null,
      userEmail: (row.userEmail as string | null) ?? null,
      action: String(row.action),
      targetTable: String(row.targetTable),
      targetId: Number(row.targetId),
      metadata: parseMetadata(row.metadata),
      createdAt: toIsoString(row.createdAt),
    };
  }

  async list(query: AuditLogQuery): Promise<AuditLogPageDto> {
    const { rows, total } = await this.repo.findPage(query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
    return {
      items: rows.map((row) => this.toItemDto(row as Record<string, unknown>)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  }

  async getById(id: number): Promise<AuditLogItemDto | null> {
    const row = await this.repo.findById(id);
    if (!row) return null;
    return this.toItemDto(row as Record<string, unknown>);
  }
}