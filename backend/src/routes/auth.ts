import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares';

const router = Router();

// POST /auth/login - Login do usuário
router.post('/login', AuthController.login);

// GET /auth/me - Obter dados do usuário autenticado
router.get('/me', authenticateToken, AuthController.me);

export default router;
