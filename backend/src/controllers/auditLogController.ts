import type { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLogService.ts';
import { auditLogIdSchema, auditLogQuerySchema, toFieldErrors } from '../schemas/auditLogSchema.ts';

export class AuditLogController {
  private auditLogService: AuditLogService;

  constructor(auditLogService: AuditLogService = new AuditLogService()) {
    this.auditLogService = auditLogService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'AUDIT_LOG_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Catatan audit tidak ditemukan' });
    }
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server' });
  }

  getAll = async (req: Request, res: Response): Promise<Response> => {
    const parsed = auditLogQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validasi gagal',
        errors: toFieldErrors(parsed.error),
      });
    }
    try {
      const data = await this.auditLogService.list(parsed.data);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const parsed = auditLogIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validasi gagal',
        errors: toFieldErrors(parsed.error),
      });
    }
    try {
      const data = await this.auditLogService.getById(parsed.data.id);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}