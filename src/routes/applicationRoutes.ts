import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController';

const router = Router();
const applicationController = new ApplicationController();

// GET ALL APPLICATIONS BY USER | /applications/users/:userId
router.get('/users/:userId', applicationController.getAllApplicationsByUserId);

// GET ALL APPLICATIONS BY NGO | /applications/ngos/:ngoId
router.get('/ngos/:ngoId', applicationController.getAllApplicationsByNgoId);

// GET ALL APPLICATIONS BY PROJECT | /applications/projects/:projectId
router.get('/projects/:projectId', applicationController.getAllApplicationsByProjectId);

// CHECK IF USER HAS APPLIED | /applications/check/:userId/:projectId
router.get('/check/:userId/:projectId', applicationController.checkUserApplication);

// CREATE APPLICATION | /applications
router.post('/', applicationController.createApplication);

// GET SINGLE APPLICATION | /applications/:id
router.get('/:id', applicationController.getApplicationById);

// UPDATE APPLICATION STATUS | /applications/:id/status
router.put('/:id/status', applicationController.updateApplicationStatus);

// UPDATE SINGLE APPLICATION | /applications/:id
router.put('/:id', applicationController.updateApplicationById);

// DELETE SINGLE APPLICATION | /applications/:id
router.delete('/:id', applicationController.deleteApplicationById);

export default router;
