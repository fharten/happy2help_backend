import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';

const router = Router();
const projectController = new ProjectController();

// GET ALL projects | /projects/activated
router.get('/', projectController.getAllProjects);

// GET all ACTIVE projects | /projects/active
router.get('/active', projectController.getAllActiveProjects);

// CREATE USER | /projects
router.post('/', projectController.createProject);

// GET SINGLE USER | /projects/:id
router.get('/:id', projectController.getProjectById);

// UPDATE SINGLE USER | /projects/:id
router.put('/:id', projectController.updateProjectById);

// DELETE SINGLE USER | /projects/:id
router.delete('/:id', projectController.deleteProjectById);

export default router;
