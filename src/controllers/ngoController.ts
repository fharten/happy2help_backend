import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Ngo } from '../models/ngoModel';
import { getImageUrl, deleteImageFile, getFilePathFromUrl } from '../middleware/uploadMiddleware';

export class NgoController {
  public ngoRepository = AppDataSource.getRepository(Ngo);

  // GET ALL | GET /api/ngos
  getAllNgos = async (req: Request, res: Response): Promise<void> => {
    try {
      const ngos = await this.ngoRepository.find();

      res.status(200).json({
        success: true,
        message: 'NGOs retrieved successfully',
        data: ngos,
        count: ngos.length,
      });
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve NGOs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL ACTIVATED | GET /api/ngos/activated
  getAllActivatedNgos = async (req: Request, res: Response): Promise<void> => {
    try {
      const ngos = await this.ngoRepository.find({
        where: { isActivated: true },
        order: { createdAt: 'DESC' },
      });

      res.status(200).json({
        success: true,
        message: 'NGOs retrieved successfully',
        data: ngos,
        count: ngos.length,
      });
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve NGOs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET SINGLE NGO | GET /api/ngos/:id
  getNgoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const ngo = await this.ngoRepository.findOne({
        where: { id },
      });

      if (!ngo) {
        res.status(404).json({
          success: false,
          message: 'NGO not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'NGO retrieved successfully',
        data: ngo,
      });
    } catch (error) {
      console.error('Error fetching NGO:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve NGO',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // CREATE NGO | POST /api/ngos
  createNgo = async (req: Request, res: Response): Promise<void> => {
    try {
      const ngoData = req.body;
      const ngo = this.ngoRepository.create(ngoData);
      const savedNgo = await this.ngoRepository.save(ngo);

      res.status(201).json({
        success: true,
        message: 'NGO created successfully',
        data: savedNgo,
      });
    } catch (error) {
      console.error('Error creating NGO:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create NGO',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPDATE SINGLE NGO | PUT /api/ngos/:id
  updateNgoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const ngoUpdate = req.body;
      const existingNgo = await this.ngoRepository.findOne({ where: { id } });

      if (!existingNgo) {
        res.status(404).json({
          success: false,
          message: 'NGO not found',
        });
        return;
      }

      await this.ngoRepository.update(id, ngoUpdate);

      const updatedNgo = await this.ngoRepository.findOne({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'NGO updated successfully',
        data: updatedNgo,
      });
    } catch (error) {
      console.error('Error updating NGO:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update NGO',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE SINGLE NGO | DELETE /api/ngos/:id
  deleteNgoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const existingNgo = await this.ngoRepository.findOne({ where: { id } });

      if (!existingNgo) {
        res.status(404).json({
          success: false,
          message: 'NGO not found',
        });
        return;
      }

      await this.ngoRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting NGO:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete NGO',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL PROJECTS OF NGO | GET /api/ngos/:id/projects
  getNgoProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeStats } = req.query;

      const ngo = await this.ngoRepository.findOne({
        where: { id },
        relations:
          includeStats === 'true'
            ? [
                'projects',
                'projects.applications',
                'projects.participants',
                'projects.skills',
                'projects.categories',
              ]
            : ['projects'],
      });

      if (!ngo) {
        res.status(404).json({
          success: false,
          message: 'NGO not found',
        });
        return;
      }

      let projects = ngo.projects;

      // If stats are requested, add them to each project
      if (includeStats === 'true') {
        projects = ngo.projects.map(project => {
          const totalApplications = project.applications?.length || 0;
          const pendingApplications =
            project.applications?.filter(app => app.status === 'pending').length || 0;
          const acceptedApplications =
            project.applications?.filter(app => app.status === 'accepted').length || 0;
          const rejectedApplications =
            project.applications?.filter(app => app.status === 'rejected').length || 0;
          const totalParticipants = project.participants?.length || 0;

          return {
            ...project,
            stats: {
              totalApplications,
              pendingApplications,
              acceptedApplications,
              rejectedApplications,
              totalParticipants,
            },
          };
        });
      }

      res.status(200).json({
        success: true,
        message: `Projects for NGO "${ngo.name}" retrieved successfully${includeStats === 'true' ? ' with statistics' : ''}`,
        data: {
          ngo: {
            id: ngo.id,
            name: ngo.name,
            projectCount: ngo.projects.length,
          },
          projects: projects,
        },
        count: ngo.projects.length,
      });
    } catch (error) {
      console.error('Error fetching NGO projects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve NGO projects',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL APPLICATIONS FOR NGO | GET /api/ngos/:id/applications
  getNgoApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const ngo = await this.ngoRepository.findOne({
        where: { id },
        relations: ['applications', 'applications.user', 'applications.project'],
      });

      if (!ngo) {
        res.status(404).json({
          success: false,
          message: 'NGO not found',
        });
        return;
      }

      ngo.applications.sort(
        (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );

      res.status(200).json({
        success: true,
        message: `Applications for NGO "${ngo.name}" retrieved successfully`,
        data: {
          ngo: {
            id: ngo.id,
            name: ngo.name,
            applicationCount: ngo.applications.length,
          },
          applications: ngo.applications,
        },
        count: ngo.applications.length,
      });
    } catch (error) {
      console.error('Error fetching NGO applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve NGO applications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET APPLICATIONS BY STATUS FOR NGO | GET /api/ngos/:id/applications/:status
  getNgoApplicationsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, status } = req.params;

      const ngo = await this.ngoRepository.findOne({
        where: { id },
        relations: ['applications', 'applications.user', 'applications.project'],
      });

      if (!ngo) {
        res.status(404).json({
          success: false,
          message: 'NGO not found',
        });
        return;
      }

      const filteredApplications = ngo.applications.filter(
        application => application.status === status
      );

      filteredApplications.sort(
        (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );

      res.status(200).json({
        success: true,
        message: `${status} applications for NGO "${ngo.name}" retrieved successfully`,
        data: {
          ngo: {
            id: ngo.id,
            name: ngo.name,
            applicationCount: filteredApplications.length,
          },
          applications: filteredApplications,
        },
        count: filteredApplications.length,
      });
    } catch (error) {
      console.error('Error fetching NGO applications by status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve NGO applications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPLOAD NGO PROFILE IMAGE | POST /api/ngos/:id/image
  uploadNgoImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file uploaded',
        });
        return;
      }

      const ngo = await this.ngoRepository.findOne({ where: { id } });

      if (!ngo) {
        res.status(404).json({
          success: false,
          message: 'NGO not found',
        });
        return;
      }

      // DELETE OLD IMAGE IF EXISTS
      if (ngo.image) {
        try {
          const oldImagePath = getFilePathFromUrl(ngo.image);
          deleteImageFile(oldImagePath);
        } catch (error) {
          console.error('Error deleting old NGO image:', error);
        }
      }

      // GENERATE NEW IMAGE URL
      const imageUrl = getImageUrl(req.file.filename, 'ngos');

      // UPDATE NGO WITH NEW IMAGE URL
      ngo.image = imageUrl;
      await this.ngoRepository.save(ngo);

      res.status(200).json({
        success: true,
        message: 'NGO profile image uploaded successfully',
        data: {
          id: ngo.id,
          image: ngo.image,
        },
      });
    } catch (error) {
      console.error('Error uploading NGO image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload NGO image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // DELETE NGO PROFILE IMAGE | DELETE /api/ngos/:id/image
  deleteNgoImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const ngo = await this.ngoRepository.findOne({ where: { id } });

      if (!ngo) {
        res.status(404).json({
          success: false,
          message: 'NGO not found',
        });
        return;
      }

      if (!ngo.image) {
        res.status(400).json({
          success: false,
          message: 'NGO has no profile image to delete',
        });
        return;
      }

      // DELETE IMAGE FILE
      try {
        const imagePath = getFilePathFromUrl(ngo.image);
        deleteImageFile(imagePath);
      } catch (error) {
        console.error('Error deleting NGO image file:', error);
      }

      // REMOVE IMAGE URL FROM NGO
      ngo.image = undefined;
      await this.ngoRepository.save(ngo);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting NGO image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete NGO image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
