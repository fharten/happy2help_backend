import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import {
  authenticateToken,
  requireEntityType,
  requireOwnerOrRole,
} from '../middleware/authMiddleware';

const router = Router();
const projectController = new ProjectController();

// GET ALL projects | /projects/
router.get('/', projectController.getAllProjects);

// GET all ACTIVE projects | /projects/active
router.get('/active', projectController.getAllActiveProjects);

// CREATE PROJECT | /projects
// PROTECTED: ONLY NGO
router.post('/', authenticateToken, requireEntityType(['ngo']), projectController.createProject);

// GET SINGLE PROJECT | /projects/:id
router.get('/:id', projectController.getProjectById);

// UPDATE SINGLE PROJECT | /projects/:id
// PROTECTED: ONLY OWNER
router.put(
  '/:id',
  authenticateToken,
  requireOwnerOrRole([], 'project'),
  projectController.updateProjectById
);

// GET ALL APPLICATIONS FOR PROJECT | /projects/:id/applications
// PROTECTED: ONLY OWNER
router.get(
  '/:id/applications',
  authenticateToken,
  requireOwnerOrRole([], 'project'),
  projectController.getProjectApplications
);

// GET ALL PARTICIPANTS FOR PROJECT | /projects/:id/participants
// PROTECTED: ONLY OWNER
router.get(
  '/:id/participants',
  authenticateToken,
  requireOwnerOrRole([], 'project'),
  projectController.getProjectParticipants
);

// GET PROJECT STATISTICS | /projects/:id/stats
// PROTECTED: ONLY ADMIN & OWNER
router.get(
  '/:id/stats',
  authenticateToken,
  requireOwnerOrRole(['admin'], 'project'),
  projectController.getProjectStats
);

// DELETE SINGLE PROJECT | /projects/:id
// PROTECTED: ONLY ADMIN & OWNER
router.delete(
  '/:id',
  authenticateToken,
  requireOwnerOrRole(['admin'], 'project'),
  projectController.deleteProjectById
);

export default router;
