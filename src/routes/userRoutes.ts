import { Router } from 'express';
import { UserController } from '../controllers/userController';
<<<<<<< HEAD
=======
import {
  authenticateAny,
  authenticateUser,
  requireAdmin,
  requireAdminOrNgo,
  requireAdminOrNgoOrOwner,
  requireAdminOrOwner,
  requireOwner,
} from '../middleware/auth';
>>>>>>> 5448d90 (Initial commit — cleaned repo)

const router = Router();
const userController = new UserController();

// GET ALL USERs | /users/
<<<<<<< HEAD
router.get('/', userController.getAllUsers);

// GET all ACTIVE USERs | /users/active
router.get('/active', userController.getAllActiveUsers);
=======
// PROTECTED: ADMINS
router.get('/', authenticateUser, requireAdmin, userController.getAllUsers);

// GET all ACTIVE USERs | /users/active
// PROTECTED: NGOS & ADMINS
router.get('/active', authenticateAny, requireAdminOrNgo, userController.getAllActiveUsers);
>>>>>>> 5448d90 (Initial commit — cleaned repo)

// CREATE USER | /users
router.post('/', userController.createUser);

// GET SINGLE USER | /users/:id
<<<<<<< HEAD
router.get('/:id', userController.getUserById);

// UPDATE SINGLE USER | /users/:id
router.put('/:id', userController.updateUserById);

// GET ALL ACCEPTED PROJECTS OF USER | /users/:id/projects
router.get('/:id/projects', userController.getUserProjects);

// GET ALL APPLICATIONS OF USER | /users/:id/applications
router.get('/:id/applications', userController.getUserApplications);

// DELETE SINGLE USER | /users/:id
router.delete('/:id', userController.deleteUserById);
=======
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
>>>>>>> 5448d90 (Initial commit — cleaned repo)

export default router;
