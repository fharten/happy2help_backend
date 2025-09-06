import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();

// GET ALL USERs | /users/
router.get('/', userController.getAllUsers);

// GET all ACTIVE USERs | /users/active
router.get('/active', userController.getAllActiveUsers);

// CREATE USER | /users
router.post('/', userController.createUser);

// GET SINGLE USER | /users/:id
router.get('/:id', userController.getUserById);

// UPDATE SINGLE USER | /users/:id
router.put('/:id', userController.updateUserById);

// GET ALL ACCEPTED PROJECTS OF USER | /users/:id/projects
router.get('/:id/projects', userController.getUserProjects);

// GET ALL APPLICATIONS OF USER | /users/:id/applications
router.get('/:id/applications', userController.getUserApplications);

// DELETE SINGLE USER | /users/:id
router.delete('/:id', userController.deleteUserById);

export default router;
