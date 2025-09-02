import { Router } from 'express';
import { SkillController } from '../controllers/skillController';

const router = Router();
const skillController = new SkillController();

// GET ALL SKILLS | /skills
router.get('/', skillController.getAllSkills);

export default router;
