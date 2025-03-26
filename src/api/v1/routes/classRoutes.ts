import { Router } from 'express';
import * as classController from '../controllers/classController';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Swagger documentation can be found in src/config/swagger/docs/classDocs.ts

const router = Router();

// GET /classes - List all classes
// All authenticated users can view classes
router.get('/', authenticate, classController.getAllClasses);

// GET /classes/subclasses - List all subclasses
// All authenticated users can view subclasses
router.get('/sub-classes', authenticate, classController.getAllSubclasses);

// POST /classes - Create a new class
// Only SUPER_MANAGER, PRINCIPAL can create classes
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL']), classController.createClass);

// GET /classes/:id - Get class details with sub-classes
// All authenticated users can view class details
router.get('/:id', authenticate, classController.getClassById);

// POST /classes/:id/sub-classes - Add a sub-class to a class
// Only SUPER_MANAGER, PRINCIPAL can add sub-classes
router.post('/:id/sub-classes', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL']), classController.addSubClass);

// DELETE /classes/:id/sub-classes/:subClassId - Delete a sub-class
// Only SUPER_MANAGER, PRINCIPAL can delete sub-classes
router.delete('/:id/sub-classes/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL']), classController.deleteSubClass);

export default router;
