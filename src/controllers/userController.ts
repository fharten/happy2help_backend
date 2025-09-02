import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../models/userModel';

export class UserController {
  public userRepository = AppDataSource.getRepository(User);

  // GET ALL USERS | GET /api/users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.find();

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
      const userData = req.body;
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);

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
      const { id } = req.params;
      const user = await this.userRepository.findOne({
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
      const { id } = req.params;
      const userUpdate = req.body;
      const existingUser = await this.userRepository.findOne({ where: { id } });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      await this.userRepository.update(id, userUpdate);
      const updatedUser = await this.userRepository.findOne({ where: { id } });

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
      const { id } = req.params;
      const existingUser = await this.userRepository.findOne({ where: { id } });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      await this.userRepository.delete(id);
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
