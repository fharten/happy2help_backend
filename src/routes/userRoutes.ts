import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();

// GET ALL USERss | /users/activated
router.get('/', userController.getAllUsers);

// GET all ACTIVATE USERs | /users/active
router.get('/active', userController.getAllActiveUsers);

// CREATE USER | /users
router.post('/', userController.createUser);

// GET SINGLE USER | /users/:id
router.get('/:id', userController.getUserById);

// UPDATE SINGLE USER | /users/:id
router.put('/:id', userController.updateUserById);

// DELETE SINGLE USER | /users/:id
router.delete('/:id', userController.deleteUserById);

export default router;
