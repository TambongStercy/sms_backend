import { Router } from 'express';
import * as academicYearController from '../controllers/academicYearController';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Swagger documentation can be found in src/config/swagger/docs/academicYearDocs.ts

const router = Router();

// GET /academic-years - List all academic years
// All authenticated users can view academic years
router.get('/', authenticate, academicYearController.getAllAcademicYears);

// POST /academic-years - Create a new academic year
// Only SUPER_MANAGER, PRINCIPAL can create academic years
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL']), academicYearController.createAcademicYear);

// GET /academic-years/:id - Get academic year details
// All authenticated users can view academic year details
router.get('/:id', authenticate, academicYearController.getAcademicYearById);

// POST /academic-years/:id/terms - Add a term to an academic year
// Only SUPER_MANAGER, PRINCIPAL can add terms
router.post('/:id/terms', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL']), academicYearController.addTerm);

// GET /academic-years/:id/terms - Get all terms for an academic year
// All authenticated users can view terms
router.get('/:id/terms', authenticate, academicYearController.getTerms);

// PUT /academic-years/:id - Update an academic year
// Only SUPER_MANAGER, PRINCIPAL can update academic years
router.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL']), academicYearController.updateAcademicYear);

// DELETE /academic-years/:id - Delete an academic year
// Only SUPER_MANAGER, PRINCIPAL can delete academic years
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL']), academicYearController.deleteAcademicYear);

export default router;
