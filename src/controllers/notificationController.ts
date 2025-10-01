import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Notification } from '../models/notificationModel';
import { notificationConnections } from '../services/notificationConnections';

export class NotificationController {
  public notificationRepository = AppDataSource.getRepository(Notification);

  // GET ALL BY USER ID | GET /api/notifications/user/:userId
  // Optional SSE: streamt Events für diesen User
  getAllUserNotificationsByUserId = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };

    const clientWantsStream =
      (typeof req.headers.accept === 'string' &&
        req.headers.accept.includes('text/event-stream')) ||
      req.query.stream === '1';

    if (clientWantsStream) {
      try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        const removeConnection = notificationConnections.addUser(id, res);
        console.log(`[SSE] User ${id} connection added to registry`);

        const refreshIntervalId = setInterval(() => {
          res.write(
            `event: ping\ndata: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`
          );
        }, 5000);

        req.on('close', () => {
          clearInterval(refreshIntervalId);
          removeConnection();
          try {
            res.end();
          } catch {}
        });
        return;
      } catch (streamError) {
        console.error('Error establishing SSE for user notifications:', streamError);
        res.status(500).json({ success: false, message: 'Failed to open notification stream' });
        return;
      }
    }

    // normale JSON-Antwort
    try {
      const notifications = await this.notificationRepository.find({
        where: { userId: id },
        order: { id: 'DESC' },
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
  // Optional SSE: streamt Events für diese NGO
  getAllNgoNotificationsByNgoId = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };

    const clientWantsStream =
      (typeof req.headers.accept === 'string' &&
        req.headers.accept.includes('text/event-stream')) ||
      req.query.stream === '1';

    if (clientWantsStream) {
      try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        const removeConnection = notificationConnections.addNgo(id, res);

        const refreshIntervalId = setInterval(() => {
          res.write(
            `event: ping\ndata: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`
          );
        }, 5000);

        req.on('close', () => {
          clearInterval(refreshIntervalId);
          removeConnection();
          try {
            res.end();
          } catch {}
        });
        return;
      } catch (streamError) {
        console.error('Error establishing SSE for NGO notifications:', streamError);
        res.status(500).json({ success: false, message: 'Failed to open notification stream' });
        return;
      }
    }

    // normale JSON-Antwort
    try {
      const notifications = await this.notificationRepository.find({
        where: { ngoId: id },
        order: { id: 'DESC' },
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
      const notification = await this.notificationRepository.findOne({
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

      // Send real-time notifications
      if (notificationData.userId) {
        notificationConnections.sendToUser(
          notificationData.userId,
          'notification',
          savedNotification
        );
      }
      if (notificationData.ngoId) {
        notificationConnections.sendToNgo(
          notificationData.ngoId,
          'notification',
          savedNotification
        );
      }

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

      if (updatedNotification?.userId) {
        notificationConnections.sendToUser(
          updatedNotification.userId,
          'notification_updated',
          updatedNotification
        );
      }
      if (updatedNotification?.ngoId) {
        notificationConnections.sendToNgo(
          updatedNotification.ngoId,
          'notification_updated',
          updatedNotification
        );
      }

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
