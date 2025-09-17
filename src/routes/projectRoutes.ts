import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import {
  authenticateToken,
  requireEntityType,
  requireOwnerOrRole,
} from '../middleware/authMiddleware';
import { uploadMultipleImages } from '../middleware/uploadMiddleware';

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

// GET ALL CATEGORIES FOR PROJECT | /projects/:id/categories
router.get('/:id/categories', projectController.getAllCategoriesByProjectId);

// UPLOAD PROJECT IMAGES | /projects/:id/images
// PROTECTED: ONLY ADMIN & OWNER
router.post(
  '/:id/images',
  authenticateToken,
  requireOwnerOrRole(['admin'], 'project'),
  (req, res, next) => {
    req.params.type = 'projects';
    next();
  },
  uploadMultipleImages,
  projectController.uploadProjectImages
);

// DELETE PROJECT IMAGE BY INDEX | /projects/:id/images/:imageIndex
// PROTECTED: ONLY ADMIN & OWNER
router.delete(
  '/:id/images/:imageIndex',
  authenticateToken,
  requireOwnerOrRole(['admin'], 'project'),
  projectController.deleteProjectImage
);

// DELETE ALL PROJECT IMAGES | /projects/:id/images
// PROTECTED: ONLY ADMIN & OWNER
router.delete(
  '/:id/images',
  authenticateToken,
  requireOwnerOrRole(['admin'], 'project'),
  projectController.deleteAllProjectImages
);

export default router;
