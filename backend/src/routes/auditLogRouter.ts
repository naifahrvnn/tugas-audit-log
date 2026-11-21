import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController.ts';
import { authenticate, requireRole } from '../middlewares/auth.ts';

const router = Router();
const controller = new AuditLogController();

router.use(authenticate, requireRole(['admin']));

router.get('/', controller.list);
router.get('/:id', controller.getById);

export default router;