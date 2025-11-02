import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authenticateToken } from '../middlewares';

const router = Router();

// Todas as rotas de eventos requerem autenticação
router.get('/', authenticateToken, EventController.list);
router.get('/:id', authenticateToken, EventController.getById);
router.post('/', authenticateToken, EventController.create);
router.put('/:id', authenticateToken, EventController.update);
router.delete('/:id', authenticateToken, EventController.delete);

export default router;

