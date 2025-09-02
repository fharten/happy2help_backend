import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();
const notificationController = new NotificationController();

// CREATE NEW NOTIFICATION | /notifications
router.post('/', notificationController.createNotification);

// GET all NOTIFICATIONs per user | /notifications/users/:userId
router.get('/users/:userId', notificationController.getAllUserNotificationsByUserId);

// GET all NOTIFICATIONs per NGO | /notifications/ngos/:ngoId
router.get('/ngos/:ngoId', notificationController.getAllNgoNotificationsByNgoId);

// UPDATE SINGLE NOTIFICATION | /notifications/:id
router.put('/:id', notificationController.updateNotificationById);

// GET SINGLE NOTIFICATION | /notifications/:id
router.get('/:id', notificationController.getNotificationById);

export default router;
