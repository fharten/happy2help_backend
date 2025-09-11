import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Project } from '../models/projectModel';

export class ProjectController {
  public projectRepository = AppDataSource.getRepository(Project);

  // GET ALL | GET /api/projects
  getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const projects = await this.projectRepository.find({
        relations: ['ngo'],
      });

      res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: projects,
        count: projects.length,
      });
    } catch (error) {
      console.error('Error fetching Projects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL ACTIVE PROJECTS | GET /api/projects/active
  getAllActiveProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const projects = await this.projectRepository.find({
        where: { isActive: true },
        relations: ['ngo'],
        order: { startingAt: 'DESC' },
      });

      res.status(200).json({
        success: true,
        message: 'Active projects retrieved successfully',
        data: projects,
        count: projects.length,
      });
    } catch (error) {
      console.error('Error fetching active projects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET SINGLE PROJECT | GET /api/projects/:id
  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['ngo', 'participants'],
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: project,
      });
    } catch (error) {
      console.error('Error fetching Project:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // CREATE PROJECT | POST /api/projects
  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectData: Project = req.body;

      if (
        !projectData.name ||
        !projectData.description ||
        !projectData.images ||
        !projectData.categories ||
        !projectData.city ||
        !projectData.zipCode ||
        !projectData.state ||
        !projectData.principal ||
        !projectData.skills ||
        !projectData.startingAt ||
        !projectData.endingAt ||
        !projectData.ngoId
      ) {
        res.status(400).json({
          success: false,
          message:
            'Name, description, images, categories, city, zip code, state, principal, skills, startingAt, endingAt, and ngoId are required fields',
        });
        return;
      }

      const project = this.projectRepository.create(projectData);
      const savedProject = await this.projectRepository.save(project);

      const fullProject = await this.projectRepository.findOne({
        where: { id: savedProject.id },
        relations: ['ngo'],
      });

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: fullProject,
      });
    } catch (error) {
      console.error('Error creating Project:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create Project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPDATE SINGLE PROJECT | PUT /api/projects/:id
  updateProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const projectUpdate = req.body;

      const existingProject = await this.projectRepository.findOne({ where: { id } });

      if (!existingProject) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      await this.projectRepository.update(id, projectUpdate);

      const updatedProject = await this.projectRepository.findOne({
        where: { id },
        relations: ['ngo'],
      });

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject,
      });
    } catch (error) {
      console.error('Error updating Project:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update Project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE SINGLE PROJECT | DELETE /api/projects/:id
  deleteProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const existingProject = await this.projectRepository.findOne({ where: { id } });

      if (!existingProject) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      await this.projectRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting Project:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete Project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL APPLICATIONS FOR PROJECT | GET /api/projects/:id/applications
  getProjectApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['applications', 'applications.user', 'ngo'],
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      project.applications.sort(
        (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );

      res.status(200).json({
        success: true,
        message: `Applications for project "${project.name}" retrieved successfully`,
        data: {
          project: {
            id: project.id,
            name: project.name,
            ngo: project.ngo,
            applicationCount: project.applications.length,
          },
          applications: project.applications,
        },
        count: project.applications.length,
      });
    } catch (error) {
      console.error('Error fetching project applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve project applications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL PARTICIPANTS FOR PROJECT | GET /api/projects/:id/participants
  getProjectParticipants = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['participants', 'ngo'],
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Participants for project "${project.name}" retrieved successfully`,
        data: {
          project: {
            id: project.id,
            name: project.name,
            ngo: project.ngo,
            participantCount: project.participants.length,
          },
          participants: project.participants,
        },
        count: project.participants.length,
      });
    } catch (error) {
      console.error('Error fetching project participants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve project participants',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET PROJECT STATISTICS | GET /api/projects/:id/stats
  getProjectStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['applications', 'participants', 'ngo'],
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      const totalApplications = project.applications.length;
      const pendingApplications = project.applications.filter(
        app => app.status === 'pending'
      ).length;
      const acceptedApplications = project.applications.filter(
        app => app.status === 'accepted'
      ).length;
      const rejectedApplications = project.applications.filter(
        app => app.status === 'rejected'
      ).length;
      const totalParticipants = project.participants.length;

      res.status(200).json({
        success: true,
        message: `Statistics for project "${project.name}" retrieved successfully`,
        data: {
          project: {
            id: project.id,
            name: project.name,
            ngo: project.ngo,
          },
          statistics: {
            totalApplications,
            pendingApplications,
            acceptedApplications,
            rejectedApplications,
            totalParticipants,
            acceptanceRate:
              totalApplications > 0
                ? ((acceptedApplications / totalApplications) * 100).toFixed(2) + '%'
                : '0%',
          },
        },
      });
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve project statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL CATEGORIES FOR PROJECT | GET /api/projects/:id/categories
  getAllCategoriesByProjectId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['categories'],
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      const categories = project.categories || [];

      res.status(200).json({
        success: true,
        message: `Categories for project "${project.name}" retrieved successfully`,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error('Error fetching project categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve project categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
