import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../models/userModel';

export class UserController {
  // GET ALL USERS | GET /api/users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // CREATE SINGLE USER | POST /api/users
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const userData = req.body;
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: savedUser,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET SINGLE USER | GET /api/users/:id
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { id } = req.params;
      const user = await userRepository.findOne({
        where: { id },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPDATE SINGLE USER | PUT /api/users/:id
  updateUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { id } = req.params;
      const userUpdate = req.body;
      const existingUser = await userRepository.findOne({ where: { id } });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      await userRepository.update(id, userUpdate);
      const updatedUser = await userRepository.findOne({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE SINGLE USER | DELETE /api/users/:id
  deleteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { id } = req.params;
      const existingUser = await userRepository.findOne({ where: { id } });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      await userRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
