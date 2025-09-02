import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// CREATE USER LOGIN | POST /api/auth/users/register
router.post('/users/register', authController.registerUser);

// CREATE NGO LOGIN | POST /api/auth/ngos/register
router.post('/ngos/register', authController.registerNgo);

// LOGIN USER | POST /api/auth/users/login
router.post('/users/login', authController.loginUser);

// LOGIN NGO | POST /api/auth/ngos/login
router.post('/ngos/login', authController.loginNgo);

export default router;
