import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

const router = Router();
const categoryController = new CategoryController();

// GET ALL CATEGORIES | /categories
router.get('/', categoryController.getAllCategories);

export default router;
