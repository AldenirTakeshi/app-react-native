import { Router } from 'express';
import { YourController } from '../controllers';

const router = Router();

router.get('/your-endpoint', YourController.getAll);
router.get('/your-endpoint/:id', YourController.getById);
router.post('/your-endpoint', YourController.create);
router.put('/your-endpoint/:id', YourController.update);
router.delete('/your-endpoint/:id', YourController.delete);

export default router;
