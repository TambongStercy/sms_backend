import { Router, Request, Response } from 'express';
import * as classController from '../controllers/classController';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Swagger documentation can be found in src/config/swagger/docs/classDocs.ts

const router = Router();

// GET /classes - List all classes
// All authenticated users can view classes
router.get('/', authenticate, classController.getAllClasses);

// GET /classes/sub-classes - List all sub_classes across all classes
// All authenticated users can view sub_classes
router.get('/sub-classes', authenticate, classController.getAllSubclasses);
router.get('/subclasses', authenticate, classController.getAllSubclasses);

// POST /classes - Create a new class
// Only SUPER_MANAGER, PRINCIPAL can create classes
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), classController.createClass);

// GET /classes/:id - Get class details with sub-classes
// All authenticated users can view class details
router.get('/:id', authenticate, classController.getClassById);

// PUT /classes/:id - Update class details
// Only SUPER_MANAGER, PRINCIPAL can update classes
router.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), classController.updateClass);

// POST /classes/:id/sub-classes - Add a new sub-class to a class
// Only SUPER_MANAGER, PRINCIPAL can add sub-classes
router.post('/:id/sub-classes', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), classController.addSubClass);
router.post('/:id/subclasses', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), classController.addSubClass);

// POST /classes/sub-classes/:sub_classId/class-master - Assign a class master to a sub_class
// Only SUPER_MANAGER, PRINCIPAL can assign class masters
router.post('/sub-classes/:sub_classId/class-master',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classController.assignClassMaster);
router.post('/subclasses/:sub_classId/class-master',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    classController.assignClassMaster);

// GET /classes/sub-classes/:sub_classId/class-master - Get the class master of a sub_class
// All authenticated users can view class master information
router.get('/sub-classes/:sub_classId/class-master',
    authenticate,
    classController.getSubclassClassMaster);
router.get('/subclasses/:sub_classId/class-master',
    authenticate,
    classController.getSubclassClassMaster);

// DELETE /classes/sub-classes/:sub_classId/class-master - Remove the class master from a sub_class
// Only SUPER_MANAGER, PRINCIPAL can remove class masters
router.delete('/sub-classes/:sub_classId/class-master',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL']),
    classController.removeClassMaster);
router.delete('/subclasses/:sub_classId/class-master',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL']),
    classController.removeClassMaster);

// GET /classes/:id/sub-classes - List all sub_classes for a specific class
// All authenticated users can view sub_classes for a specific class
// Note: This overlaps with GET /classes/sub-classes?classId= but provides a RESTful alternative
router.get('/:id/sub-classes', authenticate, (req: Request, res: Response) => {
    // Redirect logic or specific handler if needed, for now point to the general one
    req.finalQuery.classId = req.params.id;
    classController.getAllSubclasses(req, res);
});
router.get('/:id/subclasses', authenticate, (req: Request, res: Response) => {
    // Redirect logic or specific handler if needed, for now point to the general one
    req.finalQuery.classId = req.params.id;
    classController.getAllSubclasses(req, res);
});

// DELETE /classes/:id/sub-classes/:subClassId - Delete a sub-class
// Only SUPER_MANAGER, PRINCIPAL can delete sub-classes
router.delete('/:id/sub-classes/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), classController.deleteSubClass);
router.delete('/:id/subclasses/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), classController.deleteSubClass);

// PUT /classes/:id/sub-classes/:subClassId - Update a sub-class
// Only SUPER_MANAGER, PRINCIPAL can update sub-classes
router.put('/:id/sub-classes/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), classController.updateSubClass);
router.put('/:id/subclasses/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']), classController.updateSubClass);

// GET /classes/sub-classes/:subClassId/subjects - Get all subjects for a specific sub_class
// All authenticated users can view subjects for a sub_class
router.get('/sub-classes/:subClassId/subjects',
    authenticate,
    classController.getSubclassSubjects);
router.get('/subclasses/:subClassId/subjects',
    authenticate,
    classController.getSubclassSubjects);

export default router;
