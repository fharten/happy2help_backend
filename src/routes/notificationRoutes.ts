import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();
const notificationController = new NotificationController();

// CREATE NEW NOTIFICATION | /notifications
router.post('/', notificationController.createNotification);

// GET all NOTIFICATIONs per user | /notifications/user/:userId
router.get('/user/:userId', notificationController.getAllUserNotificationsByUserId);

// GET all NOTIFICATIONs per NGO | /notifications/ngo/:ngoId
router.get('/ngo/:ngoId', notificationController.getAllNgoNotificationsByNgoId);

// UPDATE SINGLE NOTIFICATION | /notifications/:id
router.put('/:id', notificationController.updateNotificationById);

// GET SINGLE NOTIFICATION | /notifications/:id
router.get('/:id', notificationController.getNotificationById);
