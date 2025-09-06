import { Router } from 'express';
import { NgoController } from '../controllers/ngoController';

const router = Router();
const ngoController = new NgoController();

// GET ALL NGOs | /ngos/
router.get('/', ngoController.getAllNgos);

// GET all ACTIVATED NGOs | /ngos/activated
router.get('/activated', ngoController.getAllActivatedNgos);

// CREATE NGO | /ngos
router.post('/', ngoController.createNgo);

// GET SINGLE NGO | /ngos/:id
router.get('/:id', ngoController.getNgoById);

// UPDATE SINGLE NGO | /ngos/:id
router.put('/:id', ngoController.updateNgoById);

// GET ALL PROJECTS OF NGO | /ngos/:id/projects
router.get('/:id/projects', ngoController.getNgoProjects);

// GET ALL APPLICATIONS FOR NGO | /ngos/:id/applications
router.get('/:id/applications', ngoController.getNgoApplications);

// GET APPLICATIONS BY STATUS FOR NGO | /ngos/:id/applications/:status
router.get('/:id/applications/:status', ngoController.getNgoApplicationsByStatus);

// DELETE SINGLE NGO | /ngos/:id
router.delete('/:id', ngoController.deleteNgoById);

export default router;
