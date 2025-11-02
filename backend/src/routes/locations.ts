import { Router } from 'express';
import { LocationController } from '../controllers/LocationController';
import { authenticateToken } from '../middlewares';

const router = Router();

router.get('/', authenticateToken, LocationController.list);
router.get('/:id', authenticateToken, LocationController.getById);
router.post('/', authenticateToken, LocationController.create);
router.put('/:id', authenticateToken, LocationController.update);
router.delete('/:id', authenticateToken, LocationController.delete);

export default router;
