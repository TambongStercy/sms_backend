import { Router } from 'express';
import * as examController from '../controllers/examController';

// Router for exam-related endpoints (mounted at /exams)
const examRouter = Router();

// POST /exams - Create an exam paper
examRouter.post('/', examController.createExam);

// POST /exams/:id/questions - Add questions to an exam
examRouter.post('/:id/questions', examController.addQuestionsToExam);

// POST /exams/:id/generate - Generate exam paper (randomize/manual)
examRouter.post('/:id/generate', examController.generateExam);

// Router for marks endpoints (to be mounted at /marks)
const marksRouter = Router();

// POST /marks - Enter exam marks for students
marksRouter.post('/', examController.enterExamMarks);

// GET /marks/report-cards - Generate report cards (PDF/Excel)
marksRouter.get('/report-cards', examController.generateReportCards);

export { marksRouter };
export default examRouter;
