import { Router } from 'express';
import * as classController from '../controllers/classController';

const router = Router();

// GET /classes - List all classes
router.get('/', classController.getAllClasses);

// POST /classes - Create a new class
router.post('/', classController.createClass);

// GET /classes/:id - Get class details with sub-classes
router.get('/:id', classController.getClassById);

// POST /classes/:id/sub-classes - Add a sub-class to a class
router.post('/:id/sub-classes', classController.addSubClass);

// DELETE /classes/:id/sub-classes/:subClassId - Delete a sub-class
router.delete('/:id/sub-classes/:subClassId', classController.deleteSubClass);

export default router;
