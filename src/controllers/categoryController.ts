import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Category } from '../models/categoryModel';
import { Project } from '../models/projectModel';

import { ApplicationStatus } from '../types/applicationRole';

export class CategoryController {
  public categoryRepository = AppDataSource.getRepository(Category);
  public projectRepository = AppDataSource.getRepository(Project);

  // GET ALL CATEGORIES BY PROJECT ID | GET /api/categories/project/:projectId
  getAllCategoriesByProjectId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      const whereConditions: any = { projectId };

      const categories = await this.categoryRepository.find({
        where: { projects: { id: projectId } },
        relations: ['projects'],
      });

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL CATEGORIES | GET /api/categories
  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryRepository.find();

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
