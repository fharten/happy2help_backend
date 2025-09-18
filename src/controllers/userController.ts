import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../models/userModel';
import { getImageUrl, deleteImageFile, getFilePathFromUrl } from '../middleware/uploadMiddleware';
import { Skill } from '../models/skillModel';

export class UserController {
  public userRepository = AppDataSource.getRepository(User);
  public skillRepository = AppDataSource.getRepository(Skill);

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

  // GET ALL ACTIVATED | GET /api/users/activated
  getAllActiveUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.find({
        where: { isActivated: true },
        order: { createdAt: 'DESC' },
      });

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
      const { skills: skillIds, ...userUpdate } = req.body;

      const existingUser = await this.userRepository.findOne({
        where: { id },
        relations: ['skills'],
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Update the existingUser object with new data
      Object.assign(existingUser, userUpdate);

      // Handle skills update if provided
      if (skillIds !== undefined) {
        let skills: Skill[] = [];
        if (Array.isArray(skillIds) && skillIds.length > 0) {
          skills = await this.skillRepository.findByIds(skillIds);
        }
        existingUser.skills = skills;
      }

      // Save everything at once
      const savedUser = await this.userRepository.save(existingUser);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: savedUser,
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

  // GET ALL ACCEPTED PROJECTS OF USER | GET /api/users/:id/projects
  getUserProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['projects', 'projects.ngo'],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const userDisplayName =
        user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.id;

      res.status(200).json({
        success: true,
        message: `Accepted projects for user "${userDisplayName}" retrieved successfully`,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            projectCount: user.projects.length,
          },
          projects: user.projects,
        },
        count: user.projects.length,
      });
    } catch (error) {
      console.error('Error fetching user projects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL APPLICATIONS OF USER | GET /api/users/:id/applications
  getUserApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['applications', 'applications.project', 'applications.project.ngo'],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const userDisplayName =
        user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.id;

      res.status(200).json({
        success: true,
        message: `Applications for user "${userDisplayName}" retrieved successfully`,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            applicationCount: user.applications.length,
          },
          applications: user.applications,
        },
        count: user.applications.length,
      });
    } catch (error) {
      console.error('Error fetching user applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user applications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPLOAD USER PROFILE IMAGE | POST /api/users/:id/image
  uploadUserImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file uploaded',
        });
        return;
      }

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // DELETE OLD IMAGE IF EXISTS
      if (user.image) {
        try {
          const oldImagePath = getFilePathFromUrl(user.image);
          deleteImageFile(oldImagePath);
        } catch (error) {
          console.error('Error deleting old user image:', error);
        }
      }

      // GENERATE NEW IMAGE URL
      const imageUrl = getImageUrl(req.file.filename, 'users');

      // UPDATE USER WITH NEW IMAGE URL
      user.image = imageUrl;
      await this.userRepository.save(user);

      res.status(200).json({
        success: true,
        message: 'User profile image uploaded successfully',
        data: {
          id: user.id,
          image: user.image,
        },
      });
    } catch (error) {
      console.error('Error uploading user image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload user image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE USER PROFILE IMAGE | DELETE /api/users/:id/image
  deleteUserImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      if (!user.image) {
        res.status(400).json({
          success: false,
          message: 'User has no profile image to delete',
        });
        return;
      }

      // DELETE IMAGE FILE
      try {
        const imagePath = getFilePathFromUrl(user.image);
        deleteImageFile(imagePath);
      } catch (error) {
        console.error('Error deleting user image file:', error);
      }

      // REMOVE IMAGE URL FROM USER
      user.image = undefined;
      await this.userRepository.save(user);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting user image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
