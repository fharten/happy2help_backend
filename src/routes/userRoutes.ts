import { Router } from 'express';
import { UserController } from '../controllers/userController';
import {
  authenticateAny,
  authenticateUser,
  requireAdmin,
  requireAdminOrNgo,
  requireAdminOrNgoOrOwner,
  requireAdminOrOwner,
  requireOwner,
} from '../middleware/auth';

const router = Router();
const userController = new UserController();

// GET ALL USERs | /users/
// PROTECTED: ADMINS
router.get('/', authenticateUser, requireAdmin, userController.getAllUsers);

// GET all ACTIVE USERs | /users/active
// PROTECTED: NGOS & ADMINS
router.get('/active', authenticateAny, requireAdminOrNgo, userController.getAllActiveUsers);

// CREATE USER | /users
router.post('/', userController.createUser);

// GET SINGLE USER | /users/:id
// PROTECTED: ADMIN, NGO, OWNER
router.get('/:id', authenticateAny, requireAdminOrNgoOrOwner, userController.getUserById);

// UPDATE SINGLE USER | /users/:id
// PROTECTED: ADMIN & OWNER
router.put('/:id', authenticateUser, requireAdminOrOwner, userController.updateUserById);

// GET ALL ACCEPTED PROJECTS OF USER | /users/:id/projects
// PROTECTED: OWNER
router.get('/:id/projects', authenticateUser, requireOwner, userController.getUserProjects);

// GET ALL APPLICATIONS OF USER | /users/:id/applications
// PROTECTED: OWNER
router.get('/:id/applications', authenticateUser, requireOwner, userController.getUserApplications);

// DELETE SINGLE USER | /users/:id
// PROTECTED: ADMIN & OWNER
router.delete('/:id', authenticateUser, requireAdminOrOwner, userController.deleteUserById);

export default router;
