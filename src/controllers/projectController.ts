import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Project } from '../models/projectModel';

export class ProjectController {
  private projectRepository = AppDataSource.getRepository(Project);

  // GET ALL | GET /api/projects
  getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const projects = await this.projectRepository.find();

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

  // GET SINGLE PROJECT | GET /api/projects/:id
  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const projects = await this.projectRepository.find({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: projects,
        count: projects.length,
      });
    } catch (error) {
      console.error('Error fetching Project:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Projec',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // CREATE PROJECT | POST /api/projects
  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectData = req.body;
      const project = this.projectRepository.create(projectData);
      const savedNgo = await this.projectRepository.save(project);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: savedNgo,
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

      const updatedProject = await this.projectRepository.findOne({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
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

      res.status(204);
    } catch (error) {
      console.error('Error deleting Project:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete Project',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
