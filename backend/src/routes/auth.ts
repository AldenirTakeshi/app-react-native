import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

router.get('/me', authenticateToken, AuthController.me);

export default router;
