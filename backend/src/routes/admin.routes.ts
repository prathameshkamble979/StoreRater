import { Router } from 'express';
import { getDashboardStats, createUser, createStore, getUsers, getUserDetails, getRatings } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema, createStoreSchema } from '../validators/admin.validator';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.post('/users', validate(createUserSchema), createUser);
router.post('/stores', validate(createStoreSchema), createStore);
router.get('/ratings', getRatings);

export default router;
