import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticateToken } from '../middlewares';

const router = Router();

router.get('/', authenticateToken, CategoryController.list);
router.get('/:id', authenticateToken, CategoryController.getById);
router.post('/', authenticateToken, CategoryController.create);
router.put('/:id', authenticateToken, CategoryController.update);
router.delete('/:id', authenticateToken, CategoryController.delete);

export default router;
