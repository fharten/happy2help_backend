import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Ngo } from '../models/ngoModel';

export class NgoController {
  private ngoRepository = AppDataSource.getRepository(Ngo);

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
  getAllActiveNgos = async (req: Request, res: Response): Promise<void> => {
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
      const ngos = await this.ngoRepository.find({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'NGO retrieved successfully',
        data: ngos,
        count: ngos.length,
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

  // CREATE SINGLE NGO | POST /api/ngos
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
      console.error('Error creating NGOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create NGOs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPDATE single NGO | PUT /api/ngos/:id
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
        message: 'NGO retrieved successfully',
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

      res.status(204);
    } catch (error) {
      console.error('Error deleting NGO:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete NGO',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
