import { Router } from 'express';
import { NgoController } from '../controllers/ngoController';
import { authenticateToken, requireOwnerOrRole, requireRole } from '../middleware/authMiddleware';

const router = Router();
const ngoController = new NgoController();

// GET ALL NGOs | /ngos/
// PROTECTED: ONLY ADMIN
router.get('/', authenticateToken, requireRole(['adminn']), ngoController.getAllNgos);

// GET all ACTIVATED NGOs | /ngos/activated
router.get('/activated', ngoController.getAllActivatedNgos);

// CREATE NGO | /ngos
router.post('/', ngoController.createNgo);

// GET SINGLE NGO | /ngos/:id
router.get('/:id', ngoController.getNgoById);

// UPDATE SINGLE NGO | /ngos/:id
// PROTECTED: ONLY ADMIN & OWNER
router.put('/:id', authenticateToken, requireOwnerOrRole(['admin']), ngoController.updateNgoById);

// GET ALL PROJECTS OF NGO | /ngos/:id/projects
router.get('/:id/projects', ngoController.getNgoProjects);

// GET ALL APPLICATIONS FOR NGO | /ngos/:id/applications
// PROTECTED: ONLY OWNER
router.get(
  '/:id/applications',
  authenticateToken,
  requireOwnerOrRole([]),
  ngoController.getNgoApplications
);

// GET APPLICATIONS BY STATUS FOR NGO | /ngos/:id/applications/:status
// PROTECTED: ONLY OWNER
router.get(
  '/:id/applications/:status',
  authenticateToken,
  requireOwnerOrRole([]),
  ngoController.getNgoApplicationsByStatus
);

// DELETE SINGLE NGO | /ngos/:id
// PROTECTED: ONLY ADMIN & OWNER
router.delete(
  '/:id',
  authenticateToken,
  requireOwnerOrRole(['admin']),
  ngoController.deleteNgoById
);

export default router;
