// src/api/v1/routes/quizRoutes.ts
import { Router } from 'express';
import * as quizController from '../controllers/quizController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// === QUIZ MANAGEMENT (Teachers/Admin) ===

// POST /quiz - Create a new quiz
router.post('/', 
    authenticate, 
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'HOD']), 
    quizController.createQuiz
);

// GET /quiz - Get all quizzes (for teachers/admin)
router.get('/', 
    authenticate, 
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'HOD']), 
    quizController.getAllQuizzes
);

// GET /quiz/:quizId/statistics - Get quiz statistics
router.get('/:quizId/statistics', 
    authenticate, 
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'HOD']), 
    quizController.getQuizStatistics
);

// === PARENT-CHILD QUIZ SYSTEM ===

// GET /quiz/student/:studentId/available - Get available quizzes for a student (parent access)
router.get('/student/:studentId/available', 
    authenticate, 
    authorize(['PARENT']), 
    quizController.getAvailableQuizzes
);

// POST /quiz/start - Start a quiz (parent supervising child)
router.post('/start', 
    authenticate, 
    authorize(['PARENT']), 
    quizController.startQuiz
);

// POST /quiz/submission/:submissionId/submit - Submit quiz answers
router.post('/submission/:submissionId/submit', 
    authenticate, 
    authorize(['PARENT']), 
    quizController.submitQuiz
);

// GET /quiz/student/:studentId/results - Get quiz results for a student (parent access)
router.get('/student/:studentId/results', 
    authenticate, 
    authorize(['PARENT']), 
    quizController.getQuizResults
);

// GET /quiz/submission/:submissionId/detailed - Get detailed quiz results with answers
router.get('/submission/:submissionId/detailed', 
    authenticate, 
    authorize(['PARENT']), 
    quizController.getDetailedQuizResults
);

export default router; 