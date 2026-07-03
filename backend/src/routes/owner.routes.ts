import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/owner.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['STORE_OWNER']));

router.get('/dashboard', getOwnerDashboard);

export default router;
