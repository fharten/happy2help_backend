import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Project } from '../models/projectModel';
import { Category } from '../models/categoryModel';
import { Skill } from '../models/skillModel';
import { getImageUrl, deleteImageFile, getFilePathFromUrl } from '../middleware/uploadMiddleware';

export class ProjectController {
  private get projectRepository() {
    return AppDataSource.getRepository(Project);
  }

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

      const existingProject = await this.projectRepository.findOne({
        where: { id },
        relations: ['ngo', 'skills', 'categories'],
      });

      if (!existingProject) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      const { skills, categories, ...projectTableFields } = projectUpdate as {
        skills?: Array<string | { id: string }>;
        categories?: Array<string | { id: string }>;
        [key: string]: any;
      };

      Object.assign(existingProject, projectTableFields);

      if (Array.isArray(skills)) {
        existingProject.skills = skills
          .map(skill => (typeof skill === 'string' ? { id: skill } : skill))
          .filter(Boolean) as Skill[];
      }
      if (Array.isArray(categories)) {
        existingProject.categories = categories
          .map(category => (typeof category === 'string' ? { id: category } : category))
          .filter(Boolean) as Category[];
      }

      const savedProject = await this.projectRepository.save(existingProject);

      const updatedProject = await this.projectRepository.findOne({
        where: { id: savedProject.id },
        relations: ['ngo', 'skills', 'categories'],
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

  // UPLOAD PROJECT IMAGES | POST /api/projects/:id/images
  uploadProjectImages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No image files uploaded',
        });
        return;
      }

      const project = await this.projectRepository.findOne({ where: { id } });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      // GENERATE URLS FOR NEW IMAGES
      const newImageUrls = req.files.map((file: Express.Multer.File) =>
        getImageUrl(file.filename, 'projects')
      );

      // ADD NEW IMAGES TO EXISTING ARRAY
      const currentImages = project.images || [];
      project.images = [...currentImages, ...newImageUrls];

      await this.projectRepository.save(project);

      res.status(200).json({
        success: true,
        message: 'Project images uploaded successfully',
        data: {
          id: project.id,
          images: project.images,
          newImages: newImageUrls,
        },
      });
    } catch (error) {
      console.error('Error uploading project images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload project images',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE PROJECT IMAGE | DELETE /api/projects/:id/images/:imageIndex
  deleteProjectImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, imageIndex } = req.params;
      const index = parseInt(imageIndex);

      if (isNaN(index)) {
        res.status(400).json({
          success: false,
          message: 'Invalid image index',
        });
        return;
      }

      const project = await this.projectRepository.findOne({ where: { id } });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      if (!project.images || project.images.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Project has no images to delete',
        });
        return;
      }

      if (index < 0 || index >= project.images.length) {
        res.status(400).json({
          success: false,
          message: 'Image index out of range',
        });
        return;
      }

      // DELETE THE IMAGE FILE
      const imageUrl = project.images[index];
      try {
        const imagePath = getFilePathFromUrl(imageUrl);
        deleteImageFile(imagePath);
      } catch (error) {
        console.error('Error deleting project image file:', error);
      }

      // REMOVE THE IMAGE URL FROM THE ARRAY
      project.images.splice(index, 1);
      await this.projectRepository.save(project);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting project image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete project image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE ALL PROJECT IMAGES | DELETE /api/projects/:id/images
  deleteAllProjectImages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const project = await this.projectRepository.findOne({ where: { id } });

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      if (!project.images || project.images.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Project has no images to delete',
        });
        return;
      }

      // DELETE ALL IMAGE FILES
      project.images.forEach(imageUrl => {
        try {
          const imagePath = getFilePathFromUrl(imageUrl);
          deleteImageFile(imagePath);
        } catch (error) {
          console.error('Error deleting project image file:', error);
        }
      });

      await this.projectRepository.save(project);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting all project images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete all project images',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
