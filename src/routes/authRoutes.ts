import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateAny } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// APPLY RATE LIMIT TO ALL AUTH ROUTES
router.use(authRateLimiter);


// CREATE USER LOGIN | POST /api/auth/users/register
router.post('/users/register', authController.registerUser);

// CREATE NGO LOGIN | POST /api/auth/ngos/register
router.post('/ngos/register', authController.registerNgo);

// LOGIN USER | POST /api/auth/users/login
router.post('/users/login', authController.loginUser);

// LOGIN NGO | POST /api/auth/ngos/login
router.post('/ngos/login', authController.loginNgo);

// TOKEN REFRESH | POST /api/auth/refresh
router.post('/refresh', authController.refreshToken);

// LOGOUT (REVOKE CURRENT SESSION) | POST /api/auth/logout
router.post('/logout', authenticateAny, authController.logout);

// LOGOUT ALL SESSIONS | POST /api/auth/logout-all
router.post('/logout-all', authenticateAny, authController.logoutAll);

// GET USER SESSIONS | GET /api/auth/sessions
router.get('/sessions', authenticateAny, authController.getSessions);

// REVOKE SPECIFIC SESSION | DELETE /api/auth/sessions/:sessionId
router.delete('/sessions/:sessionId', authenticateAny, authController.revokeSession);


export default router;
