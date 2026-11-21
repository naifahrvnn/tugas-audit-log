import { and, count, desc, eq, gte, lt, type SQL } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { auditLogs, users } from '../db/schema.ts';
import type { AuditLogQuery } from '../schemas/auditLogSchema.ts';

export interface AuditEntry {
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata?: Record<string, unknown> | null;
}

// db biasa atau tx dari db.transaction(); keduanya punya .insert()
export type AuditExecutor = Pick<Awaited<ReturnType<typeof getDb>>, 'insert'>;

const selectedColumns = {
  id: auditLogs.id,
  userId: auditLogs.userId,
  userName: users.name,
  userEmail: users.email,
  action: auditLogs.action,
  targetTable: auditLogs.targetTable,
  targetId: auditLogs.targetId,
  metadata: auditLogs.metadata,
  createdAt: auditLogs.createdAt,
};

function buildWhere(query: AuditLogQuery): SQL | undefined {
  const conditions: SQL[] = [];
  if (query.action) conditions.push(eq(auditLogs.action, query.action));
  if (query.targetTable) conditions.push(eq(auditLogs.targetTable, query.targetTable));
  if (query.targetId !== undefined) conditions.push(eq(auditLogs.targetId, query.targetId));
  if (query.userId !== undefined) conditions.push(eq(auditLogs.userId, query.userId));
  if (query.from) conditions.push(gte(auditLogs.createdAt, new Date(`${query.from}T00:00:00.000Z`)));
  if (query.to) {
    const nextDay = new Date(`${query.to}T00:00:00.000Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1); // batas akhir hari, inklusif
    conditions.push(lt(auditLogs.createdAt, nextDay));
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export class AuditLogRepository {
  async insert(entry: AuditEntry, executor?: AuditExecutor): Promise<void> {
    const target = executor ?? (await getDb());
    await target.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      targetTable: entry.targetTable,
      targetId: entry.targetId,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    });
  }

  async findPage(query: AuditLogQuery) {
    const db = await getDb();
    const where = buildWhere(query);
    const offset = (query.page - 1) * query.pageSize;

    const rows = await db
      .select(selectedColumns)
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(where)
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .offset(offset)
      .fetch(query.pageSize);

    // total dihitung dari baris yang lolos filter, bukan seluruh tabel
    const totals = await db.select({ total: count() }).from(auditLogs).where(where);
    return { rows, total: Number(totals[0]?.total ?? 0) };
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db
      .select(selectedColumns)
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.id, id));
    return rows[0];
  }
}