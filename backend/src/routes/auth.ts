import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', authenticateToken, AuthController.logout);

router.get('/me', authenticateToken, AuthController.me);
router.put(
  '/avatar',
  authenticateToken,
  upload.single('avatar'),
  AuthController.updateAvatar,
);

export default router;
