import { Router } from 'express';
import { postSalary, fetchSalary } from '../controllers/salaryController';

const router = Router();

router.post('/salary', postSalary);
router.get('/salary', fetchSalary);

export default router;
