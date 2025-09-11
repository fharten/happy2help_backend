import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

const router = Router();
const categoryController = new CategoryController();

// GET ALL CATEGORIES | /categories
router.get('/', categoryController.getAllCategories);

// GET ALL CATEGORIES OF A PROJECT | /categories/projects/:id
router.get('/:id/projects', categoryController.getAllCategoriesByProjectId);

export default router;
