import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController.ts';
import { authenticate } from '../middlewares/auth.ts'; // <- samakan dengan stallRouter.ts
import { authorize } from '../middlewares/authorize.ts';

const auditLogRouter = Router();
const auditLogController = new AuditLogController();

// Append-only: hanya baca. Tidak ada endpoint tulis/ubah/hapus dari aplikasi.
auditLogRouter.get('/', authenticate, authorize('admin'), auditLogController.getAll);
auditLogRouter.get('/:id', authenticate, authorize('admin'), auditLogController.getById);

export { auditLogRouter };