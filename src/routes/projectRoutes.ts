import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';

const router = Router();
const projectController = new ProjectController();

// GET ALL projects | /projects/
router.get('/', projectController.getAllProjects);

// GET all ACTIVE projects | /projects/active
router.get('/active', projectController.getAllActiveProjects);

// CREATE PROJECT | /projects
router.post('/', projectController.createProject);

// GET SINGLE PROJECT | /projects/:id
router.get('/:id', projectController.getProjectById);

// UPDATE SINGLE PROJECT | /projects/:id
router.put('/:id', projectController.updateProjectById);

// GET ALL APPLICATIONS FOR PROJECT | /projects/:id/applications
router.get('/:id/applications', projectController.getProjectApplications);

// GET ALL PARTICIPANTS FOR PROJECT | /projects/:id/participants
router.get('/:id/participants', projectController.getProjectParticipants);

// GET PROJECT STATISTICS | /projects/:id/stats
router.get('/:id/stats', projectController.getProjectStats);

// DELETE SINGLE PROJECT | /projects/:id
router.delete('/:id', projectController.deleteProjectById);

export default router;
