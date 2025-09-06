import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Application } from '../models/applicationModel';
import { Project } from '../models/projectModel';
import { User } from '../models/userModel';
import { ApplicationStatus } from '../types/applicationRole';

export class ApplicationController {
  public applicationRepository = AppDataSource.getRepository(Application);
  public projectRepository = AppDataSource.getRepository(Project);
  public userRepository = AppDataSource.getRepository(User);

  // GET ALL BY USER ID | GET /api/applications/user/:userId
  getAllApplicationsByUserId = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    try {
      const applications = await this.applicationRepository.find({
        where: { userId },
        relations: ['project', 'project.ngo'],
        order: { appliedAt: 'DESC' },
      });

      res.status(200).json({
        success: true,
        message: 'Applications retrieved successfully',
        data: applications,
        count: applications.length,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve applications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL BY NGO ID | GET /api/applications/ngo/:ngoId
  getAllApplicationsByNgoId = async (req: Request, res: Response): Promise<void> => {
    const { ngoId } = req.params;
    const { status } = req.query;

    try {
      const whereConditions: any = { ngoId };
      if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
        whereConditions.status = status;
      }

      const applications = await this.applicationRepository.find({
        where: whereConditions,
        relations: ['user', 'project'],
        order: { appliedAt: 'DESC' },
      });

      res.status(200).json({
        success: true,
        message: 'Applications retrieved successfully',
        data: applications,
        count: applications.length,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve applications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL BY PROJECT ID | GET /api/applications/project/:projectId
  getAllApplicationsByProjectId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { status } = req.query;

      const whereConditions: any = { projectId };
      if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
        whereConditions.status = status;
      }

      const applications = await this.applicationRepository.find({
        where: whereConditions,
        relations: ['user'],
        order: { appliedAt: 'DESC' },
      });

      res.status(200).json({
        success: true,
        message: 'Applications retrieved successfully',
        data: applications,
        count: applications.length,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve applications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET SINGLE APPLICATION | GET /api/applications/:id
  getApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const application = await this.applicationRepository.findOne({
        where: { id },
        relations: ['user', 'project', 'ngo'],
      });

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Application not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Application retrieved successfully',
        data: application,
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve application',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // CREATE APPLICATION | POST /api/applications
  createApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, userId, message } = req.body;

      if (!projectId || !userId) {
        res.status(400).json({
          success: false,
          message: 'projectId and userId are required fields',
        });
        return;
      }

      const existingApplication = await this.applicationRepository.findOne({
        where: { userId, projectId },
      });

      if (existingApplication) {
        res.status(409).json({
          success: false,
          message: 'User has already applied to this project',
        });
        return;
      }

      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['ngo'],
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const application = this.applicationRepository.create({
        projectId,
        userId,
        ngoId: project.ngoId,
        message,
        status: ApplicationStatus.PENDING,
      });

      const savedApplication = await this.applicationRepository.save(application);

      const fullApplication = await this.applicationRepository.findOne({
        where: { id: savedApplication.id },
        relations: ['user', 'project', 'ngo'],
      });

      res.status(201).json({
        success: true,
        message: 'Application created successfully',
        data: fullApplication,
      });
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create application',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPDATE APPLICATION STATUS | PUT /api/applications/:id/status
  updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;

      if (!status || !Object.values(ApplicationStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Valid status is required (pending, accepted, rejected)',
        });
        return;
      }

      const existingApplication = await this.applicationRepository.findOne({
        where: { id },
        relations: ['user', 'project'],
      });

      if (!existingApplication) {
        res.status(404).json({
          success: false,
          message: 'Application not found',
        });
        return;
      }

      await this.applicationRepository.update(id, {
        status,
        reviewNotes,
      });

      if (status === ApplicationStatus.ACCEPTED) {
        const user = await this.userRepository.findOne({
          where: { id: existingApplication.userId },
          relations: ['projects'],
        });

        const project = await this.projectRepository.findOne({
          where: { id: existingApplication.projectId },
          relations: ['participants'],
        });

        if (user && project) {
          const isAlreadyParticipant = project.participants.some(p => p.id === user.id);
          if (!isAlreadyParticipant) {
            project.participants.push(user);
            await this.projectRepository.save(project);
          }
        }
      }

      const updatedApplication = await this.applicationRepository.findOne({
        where: { id },
        relations: ['user', 'project', 'ngo'],
      });

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: updatedApplication,
      });
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPDATE SINGLE APPLICATION | PUT /api/applications/:id
  updateApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const applicationUpdate = req.body;

      const existingApplication = await this.applicationRepository.findOne({ where: { id } });

      if (!existingApplication) {
        res.status(404).json({
          success: false,
          message: 'Application not found',
        });
        return;
      }

      await this.applicationRepository.update(id, applicationUpdate);

      const updatedApplication = await this.applicationRepository.findOne({
        where: { id },
        relations: ['user', 'project', 'ngo'],
      });

      res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        data: updatedApplication,
      });
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE SINGLE APPLICATION | DELETE /api/applications/:id
  deleteApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const existingApplication = await this.applicationRepository.findOne({ where: { id } });

      if (!existingApplication) {
        res.status(404).json({
          success: false,
          message: 'Application not found',
        });
        return;
      }

      await this.applicationRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete application',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // CHECK IF USER HAS APPLIED | GET /api/applications/check/:userId/:projectId
  checkUserApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, projectId } = req.params;

      const application = await this.applicationRepository.findOne({
        where: { userId, projectId },
      });

      res.status(200).json({
        success: true,
        message: 'Application check completed',
        data: {
          hasApplied: !!application,
          application: application || null,
        },
      });
    } catch (error) {
      console.error('Error checking application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check application',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
