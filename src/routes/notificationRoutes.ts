import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken, requireOwnerOrRole } from '../middleware/authMiddleware';

const router = Router();
const notificationController = new NotificationController();

// CREATE NEW NOTIFICATION | /notifications
router.post('/', notificationController.createNotification);

// GET all NOTIFICATIONs per user | /notifications/users/:userId
// PROTECTED: ONLY OWNER
router.get(
  '/users/:id',
  authenticateToken,
  requireOwnerOrRole([], 'user'),
  notificationController.getAllUserNotificationsByUserId
);

// GET all NOTIFICATIONs per NGO | /notifications/ngos/:ngoId
// PROTECTED: ONLY OWNER
router.get(
  '/ngos/:id',
  authenticateToken,
  requireOwnerOrRole([], 'ngo'),
  notificationController.getAllNgoNotificationsByNgoId
);

// UPDATE SINGLE NOTIFICATION | /notifications/:id
// PROTECTED: ONLY OWNER
router.put(
  '/:id',
  authenticateToken,
  requireOwnerOrRole([], 'notifications'),
  notificationController.updateNotificationById
);

// GET SINGLE NOTIFICATION | /notifications/:id
// PROTECTED: ONLY OWNER
router.get(
  '/:id',
  authenticateToken,
  requireOwnerOrRole([], 'notifications'),
  notificationController.getNotificationById
);

export default router;
