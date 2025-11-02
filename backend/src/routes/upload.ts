import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { authenticateToken } from '../middlewares';
import { upload } from '../middlewares/upload';

const router = Router();

router.post(
  '/image',
  authenticateToken,
  upload.single('image'),
  UploadController.uploadImage,
);

export default router;

