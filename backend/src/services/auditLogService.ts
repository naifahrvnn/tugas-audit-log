import {
  AuditLogRepository,
  type AuditEntry,
  type AuditExecutor,
} from '../repositories/auditLogRepository.ts';
import type { AuditLogItemDto, AuditLogPageDto } from '../dtos/auditLogDto.ts';
import type { AuditLogQuery } from '../schemas/auditLogSchema.ts';
import type { RequestContext } from '../utils/requestContext.ts';

type AuditRow = NonNullable<Awaited<ReturnType<AuditLogRepository['findById']>>>;

function parseMetadata(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function toItem(row: AuditRow): AuditLogItemDto {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName ?? null,
    userEmail: row.userEmail ?? null,
    action: row.action,
    targetTable: row.targetTable,
    targetId: row.targetId,
    metadata: parseMetadata(row.metadata),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
  };
}

interface AuthEventUser {
  id: number;
  role: string;
}

export class AuditLogService {
  private auditLogRepository: AuditLogRepository;

  constructor(auditLogRepository: AuditLogRepository = new AuditLogRepository()) {
    this.auditLogRepository = auditLogRepository;
  }

  /** Dipakai di dalam transaksi mutasi (bonus) supaya audit ikut atomik. */
  async record(entry: AuditEntry, executor?: AuditExecutor): Promise<void> {
    await this.auditLogRepository.insert(entry, executor);
  }

  /** Best-effort: gagal menulis audit tidak boleh menggagalkan login/logout. */
  private async recordAuth(
    action: 'LOGIN' | 'LOGOUT',
    user: AuthEventUser,
    context: RequestContext,
    result: 'success' | 'failure',
  ): Promise<void> {
    try {
      await this.record({
        userId: user.id,
        action,
        targetTable: 'USERS',
        targetId: user.id,
        metadata: {
          role: user.role,
          ip_address: context.ipAddress,
          user_agent: context.userAgent,
          result,
        },
      });
    } catch (error) {
      console.error(`Audit ${action} gagal dicatat:`, error);
    }
  }

  recordLogin(user: AuthEventUser, context: RequestContext, result: 'success' | 'failure' = 'success') {
    return this.recordAuth('LOGIN', user, context, result);
  }

  recordLogout(user: AuthEventUser, context: RequestContext, result: 'success' | 'failure' = 'success') {
    return this.recordAuth('LOGOUT', user, context, result);
  }

  async list(query: AuditLogQuery): Promise<AuditLogPageDto> {
    const { rows, total } = await this.auditLogRepository.findPage(query);
    return {
      items: rows.map(toItem),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      },
    };
  }

  async getById(id: number): Promise<AuditLogItemDto> {
    const row = await this.auditLogRepository.findById(id);
    if (!row) throw new Error('AUDIT_LOG_NOT_FOUND');
    return toItem(row);
  }
}