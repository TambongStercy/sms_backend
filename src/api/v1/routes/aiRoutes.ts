// AI assistant routes — natural-language questions over school data.
//
// Restricted to the leadership roles. The assistant reads across the whole
// school: enrolment, fees, marks, discipline. That is the same breadth the
// overview endpoints already grant these roles, and narrower than what a
// SUPER_MANAGER can read through the normal API — but it is not something a
// teacher or parent account should reach.

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as ai from '../controllers/aiAssistantController';

const router = Router();

router.use(authenticate);

const ASSISTANT_ROLES = ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL'];

router.post('/ask',    authorize(ASSISTANT_ROLES), ai.ask);
router.get('/status',  authorize(ASSISTANT_ROLES), ai.status);

export default router;
