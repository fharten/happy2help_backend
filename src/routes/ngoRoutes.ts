import { Router } from 'express';
import { NgoController } from '../controllers/ngoController';

const router = Router();
const ngoController = new NgoController();

// GET ALL NGOs | /ngos/activated
router.get('/', ngoController.getAllNgos);

// GET all ACTIVATED NGOs | /ngos/activated
router.get('/activated', ngoController.getAllActivatedNgos);

// CREATE NGO | /ngos
router.post('/', ngoController.createNgo);

// GET SINGLE NGO | /ngos/:id
router.get('/:id', ngoController.getNgoById);

// UPDATE SINGLE NGO | /ngos/:id
router.put('/:id', ngoController.updateNgoById);

// DELETE SINGLE NGO | /ngos/:id
router.delete('/:id', ngoController.deleteNgoById);

export default router;
