import { Router } from 'express';
import * as classController from '../controllers/classController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /classes - List all classes
// All authenticated users can view classes
router.get('/', authenticate, classController.getAllClasses);

// POST /classes - Create a new class
// Only ADMIN, PRINCIPAL can create classes
router.post('/', authenticate, authorize(['ADMIN', 'PRINCIPAL']), classController.createClass);

// GET /classes/:id - Get class details with sub-classes
// All authenticated users can view class details
router.get('/:id', authenticate, classController.getClassById);

// POST /classes/:id/sub-classes - Add a sub-class to a class
// Only ADMIN, PRINCIPAL can add sub-classes
router.post('/:id/sub-classes', authenticate, authorize(['ADMIN', 'PRINCIPAL']), classController.addSubClass);

// DELETE /classes/:id/sub-classes/:subClassId - Delete a sub-class
// Only ADMIN, PRINCIPAL can delete sub-classes
router.delete('/:id/sub-classes/:subClassId', authenticate, authorize(['ADMIN', 'PRINCIPAL']), classController.deleteSubClass);

export default router;
