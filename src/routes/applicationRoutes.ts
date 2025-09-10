import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController';
import {
  authenticateToken,
  requireEntityType,
  requireOwnerByParam,
  requireOwnerOrRole,
} from '../middleware/authMiddleware';

const router = Router();
const applicationController = new ApplicationController();

// GET ALL APPLICATIONS BY USER | /applications/users/:userId
// PROTECTED: ONLY OWNER
router.get(
  '/users/:userId',
  authenticateToken,
  requireOwnerOrRole([]),
  applicationController.getAllApplicationsByUserId
);

// GET ALL APPLICATIONS BY NGO | /applications/ngos/:ngoId
// PROTECTED: ONLY OWNER
router.get(
  '/ngos/:ngoId',
  authenticateToken,
  requireOwnerOrRole([]),
  applicationController.getAllApplicationsByNgoId
);

// GET ALL APPLICATIONS BY PROJECT | /applications/projects/:projectId
// PROTECTED: ONLY OWNER
router.get(
  '/projects/:projectId',
  authenticateToken,
  requireOwnerOrRole([], 'project'),
  applicationController.getAllApplicationsByProjectId
);

// CHECK IF USER HAS APPLIED | /applications/check/:userId/:projectId
// PROTECTED: ONLY OWNER
router.get(
  '/check/:userId/:projectId',
  authenticateToken,
  requireOwnerByParam('userId'),
  applicationController.checkUserApplication
);

// CREATE APPLICATION | /applications
// PROTECTED: ONLY USER
router.post(
  '/',
  authenticateToken,
  requireEntityType(['user']),
  applicationController.createApplication
);

// GET SINGLE APPLICATION | /applications/:id
// PROTECTED: ONLY OWNER NGO
router.get('/:id', applicationController.getApplicationById);

// UPDATE APPLICATION STATUS | /applications/:id/status
router.put(
  '/:id/status',
  authenticateToken,
  requireEntityType(['ngo']),
  requireOwnerOrRole([], 'application'),
  applicationController.updateApplicationStatus
);

// UPDATE SINGLE APPLICATION | /applications/:id
// PROTECTED: ONLY OWNER NGO
router.put(
  '/:id',
  authenticateToken,
  requireEntityType(['ngo']),
  requireOwnerOrRole([], 'application'),
  applicationController.updateApplicationById
);

// DELETE SINGLE APPLICATION | /applications/:id
// PROTECTED: ONLY OWNER NGO & OWNER USER
router.delete(
  '/:id',
  authenticateToken,
  requireOwnerOrRole([], 'application'),
  applicationController.deleteApplicationById
);

export default router;
