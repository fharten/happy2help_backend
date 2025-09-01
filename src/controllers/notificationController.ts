import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Notification } from '../models/notificationModel';

export class NotificationController {
  private notificationRepository = AppDataSource.getRepository(Notification);

  // GET ALL BY USER ID | GET /api/notifications/user/:userId
  getAllUserNotificationsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const notifications = await this.notificationRepository.find({
        where: { userId },
      });

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET ALL BY NGO ID | GET /api/notifications/ngo/:ngoId
  getAllNgoNotificationsByNgoId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ngoId } = req.params;
      const notifications = await this.notificationRepository.find({
        where: { ngoId },
      });

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET SINGLE NOTIFICATION | GET /api/notifications/:id
  getNotificationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await this.notificationRepository.find({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Notification retrieved successfully',
        data: notification,
      });
    } catch (error) {
      console.error('Error fetching notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // CREATE SINGLE NOTIFICATION | POST /api/notifications
  createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const notificationData = req.body;

      if (
        !notificationData.name ||
        !notificationData.userId ||
        !notificationData.ngoId ||
        !notificationData.description
      ) {
        res.status(400).json({
          success: false,
          message: 'Required fields missing: name, userId, ngoId, description',
        });
        return;
      }

      const notification = this.notificationRepository.create(notificationData);
      const savedNotification = await this.notificationRepository.save(notification);

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: savedNotification,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // UPDATE SINGLE NOTIFICATION | PUT /api/notifications/:id
  updateNotificationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const notificationUpdate = req.body;
      const existingNotification = await this.notificationRepository.findOne({ where: { id } });

      if (!existingNotification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      await this.notificationRepository.update(id, notificationUpdate);

      const updatedNotification = await this.notificationRepository.findOne({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'Notification retrieved successfully',
        data: updatedNotification,
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
