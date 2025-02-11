import { Router } from 'express';
import * as academicYearController from '../controllers/academicYearController';

const router = Router();

// GET /academic-years - List all academic years
router.get('/', academicYearController.getAllAcademicYears);

// POST /academic-years - Create a new academic year
router.post('/', academicYearController.createAcademicYear);

// GET /academic-years/:id - Get details of an academic year
router.get('/:id', academicYearController.getAcademicYearById);

// PUT /academic-years/:id - Update an academic year
router.put('/:id', academicYearController.updateAcademicYear);

// DELETE /academic-years/:id - Delete an academic year
router.delete('/:id', academicYearController.deleteAcademicYear);

export default router;
