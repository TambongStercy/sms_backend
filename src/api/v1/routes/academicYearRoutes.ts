import { Router } from 'express';
import * as academicYearController from '../controllers/academicYearController';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Swagger documentation can be found in src/config/swagger/docs/academicYearDocs.ts

const router = Router();

// GET /academic-years - List all academic years
// All authenticated users can view academic years
router.get('/', authenticate, academicYearController.getAllAcademicYears);

// GET /academic-years/current - Get current academic year
// All authenticated users can view current academic year
router.get('/current', authenticate, academicYearController.getCurrentAcademicYear);

// GET /academic-years/available-for-role - Get academic years available for a specific role
// All authenticated users can view available academic years for their role
router.get('/available-for-role', authenticate, academicYearController.getAvailableAcademicYearsForRole);

// POST /academic-years - Create a new academic year
// Only SUPER_MANAGER, PRINCIPAL can create academic years
router.post('/', authenticate, authorize(['SUPER_MANAGER']), academicYearController.createAcademicYear);

// GET /academic-years/:id - Get academic year details
// All authenticated users can view academic year details
router.get('/:id', authenticate, academicYearController.getAcademicYearById);

// POST /academic-years/:id/terms - Add a term to an academic year
// Only SUPER_MANAGER, PRINCIPAL can add terms
router.post('/:id/terms', authenticate, authorize(['SUPER_MANAGER']), academicYearController.addTerm);

// GET /academic-years/:id/terms - Get all terms for an academic year
// All authenticated users can view terms
router.get('/:id/terms', authenticate, academicYearController.getTerms);

// PUT /academic-years/:id - Update an academic year
// Only SUPER_MANAGER, PRINCIPAL can update academic years
router.put('/:id', authenticate, authorize(['SUPER_MANAGER']), academicYearController.updateAcademicYear);

// POST /academic-years/:id/set-current - Set an academic year as current
// Only SUPER_MANAGER, PRINCIPAL can set current academic year
router.post('/:id/set-current', authenticate, authorize(['SUPER_MANAGER']), academicYearController.setCurrentAcademicYear);

// DELETE /academic-years/:id - Delete an academic year
// Only SUPER_MANAGER, PRINCIPAL can delete academic years
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER']), academicYearController.deleteAcademicYear);

export default router;
