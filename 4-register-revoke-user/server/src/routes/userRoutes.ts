import { Router } from 'express';
import { createKey } from '../controllers/userController';

const router = Router();

router.post('/register', createKey);


export default router;
