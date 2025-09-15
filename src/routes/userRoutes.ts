import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireRole, requireOwnerOrRole } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

// GET ALL USERs | /users/
// PROTECTED: ONLY ADMIN
router.get('/', authenticateToken, requireRole(['admin']), userController.getAllUsers);

// GET all ACTIVE USERs | /users/active
// PROTECTED: ONLY ADMIN & NGO
router.get(
  '/active',
  authenticateToken,
  requireRole(['admin', 'ngo']),
  userController.getAllActiveUsers
);

// CREATE USER | /users
router.post('/', userController.createUser);

// GET SINGLE USER | /users/:id
// PROTECTED: ONLY ADMIN & NGO & OWNER
router.get(
  '/:id',
  authenticateToken,
  requireOwnerOrRole(['admin', 'ngo']),
  userController.getUserById
);

// UPDATE SINGLE USER | /users/:id
// PROTECTED: ONLY ADMIN & OWNER
router.put('/:id', authenticateToken, requireOwnerOrRole(['admin']), userController.updateUserById);

// GET ALL ACCEPTED PROJECTS OF USER | /users/:id/projects
// PROTECTED: ONLY OWNER
router.get(
  '/:id/projects',
  authenticateToken,
  requireOwnerOrRole([]),
  userController.getUserProjects
);

// GET ALL APPLICATIONS OF USER | /users/:id/applications
// PROTECTED: ONLY OWNER
router.get(
  '/:id/applications',
  authenticateToken,
  requireOwnerOrRole([]),
  userController.getUserApplications
);

// DELETE SINGLE USER | /users/:id
// PROTECTED: ONLY ADMIN & OWNER
router.delete(
  '/:id',
  authenticateToken,
  requireOwnerOrRole(['admin']),
  userController.deleteUserById
);

export default router;
