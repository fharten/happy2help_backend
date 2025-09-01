import { Router } from 'express';
import { NgoController } from '../controllers/ngoController';

const router = Router();
const ngoController = new NgoController();

// GET ALL NGOs | /ngos/activated
router.get('/', ngoController.getAllNgos);

// // GET SINGLE NGO | /ngos/:id
// router.get('/:id', ngoController.getNgoById);

// // GET all ACTIVATED NGOs | /ngos/activated
// router.get('/activated', ngoController.getAllActiveNgos);

// // CREATE NGO | /ngos
// router.post('/', ngoController.createNgo);

// // UPDATE SINGLE NGO | /ngos/:id
// router.put('/:id', ngoController.updateNgoById);

// // DELETE SINGLE NGO | /ngos/:id
// router.delete('/:id', ngoController.deleteNgoById);

export default router;
