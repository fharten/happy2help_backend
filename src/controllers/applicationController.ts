import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Application } from '../models/applicationModel';

export class ApplicationController {
  public applicationRepository = AppDataSource.getRepository(Application);

  // GET ALL BY USER ID | GET /api/applications/user/:userId
  getAllApplicationsByUserId = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    try {
      const applications = await this.applicationRepository.find({ where: { userId } });

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
    try {
      const applications = await this.applicationRepository.find({ where: { ngoId } });

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
      const applications = await this.applicationRepository.find({ where: { projectId } });

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
      });

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
  createApplicationByProjectId = async (req: Request, res: Response): Promise<void> => {
    try {
      const applicationData = req.body;

      if (
        !applicationData.projectId ||
        !applicationData.userId ||
        !applicationData.ngoId ||
        !applicationData.status
      ) {
        res.status(400).json({
          success: false,
          message:
            'Required fields missing: firstName, lastName, yearOfBirth, zipCode, city, state',
        });
        return;
      }

      const application = this.applicationRepository.create(applicationData);
      const savedApplication = await this.applicationRepository.save(application);

      res.status(201).json({
        success: true,
        message: 'Application created successfully',
        data: savedApplication,
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

  // UPDATE SINGLE APPLICATION | PUT /api/applications/:id
  updateApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const applicationUpdate = req.body;

      if (!applicationUpdate.projectId || !applicationUpdate.status) {
        res.status(400).json({
          success: false,
          message:
            'Required fields missing: firstName, lastName, yearOfBirth, zipCode, city, state',
        });
        return;
      }

      const existingApplication = await this.applicationRepository.findOne({ where: { id } });

      if (!existingApplication) {
        res.status(404).json({
          success: false,
          message: 'Application not found',
        });
        return;
      }

      await this.applicationRepository.update(id, applicationUpdate);

      const updatedApplication = await this.applicationRepository.findOne({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'Application retrieved successfully',
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
}
