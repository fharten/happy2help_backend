import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Skill } from '../models/skillModel';

export class SkillController {
  private get skillRepository() {
    return AppDataSource.getRepository(Skill);
  }

  // GET ALL | GET /api/skills
  getAllSkills = async (req: Request, res: Response): Promise<void> => {
    try {
      const skills = await this.skillRepository.find();

      res.status(200).json({
        success: true,
        message: 'Skills retrieved successfully',
        data: skills,
        count: skills.length,
      });
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve skills',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
