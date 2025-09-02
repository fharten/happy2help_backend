import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// CREATE USER LOGIN | POST /api/auth/user/register
router.post('/user/register', authController.registerUser);

// CREATE NGO LOGIN | POST /api/auth/ngo/register
router.post('/ngo/register', authController.registerNgo);

// LOGIN USER | POST /api/auth/user/login
router.post('/user/login', authController.loginUser);

// LOGIN NGO | POST /api/auth/ngo/login
router.post('/ngo/login', authController.loginNgo);

export default router;
