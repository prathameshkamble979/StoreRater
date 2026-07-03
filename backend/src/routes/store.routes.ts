import { Router } from 'express';
import { getStores, getStoreDetails } from '../controllers/store.controller';
import { submitRating } from '../controllers/rating.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// In a real app, you might have optional authentication. For this, we'll make list public, but details optional auth.
// We need an optional auth middleware for getStoreDetails to fetch user's own rating if logged in.
// We'll just use a try-catch pattern in a custom middleware, or assume authenticate throws if no token.

router.get('/', authenticate, authorize(['ADMIN', 'NORMAL']), getStores);

router.get('/:id', authenticate, authorize(['ADMIN', 'NORMAL']), getStoreDetails);

// Ratings must be authenticated
router.post('/:storeId/ratings', authenticate, submitRating);

export default router;
