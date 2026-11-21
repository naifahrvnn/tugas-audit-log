import type { NextFunction, Request, Response } from 'express';
import { auditLogIdSchema, auditLogQuerySchema, toFieldErrors } from '../schemas/auditLogSchema.ts';
import { AuditLogService } from '../services/auditLogService.ts';

export class AuditLogController {
  constructor(private readonly service = new AuditLogService()) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = auditLogQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          message: 'Parameter query tidak valid',
          errors: toFieldErrors(parsed.error),
        });
        return;
      }

      const result = await this.service.list(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = auditLogIdSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({
          message: 'Parameter id tidak valid',
          errors: toFieldErrors(parsed.error),
        });
        return;
      }

      const item = await this.service.getById(parsed.data.id);
      if (!item) {
        res.status(404).json({ message: 'Audit log tidak ditemukan' });
        return;
      }

      res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  };
}