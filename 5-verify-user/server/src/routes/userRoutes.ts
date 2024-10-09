import { Router } from 'express';
import { createKey, getAllUser } from '../controllers/userController';

const router = Router();

router.post('/register', createKey);
router.post('/getAllUser', getAllUser);


export default router;
