import { Router } from 'express';
import { postExpense, fetchExpenses } from '../controllers/expenseController';

const router = Router();

router.post('/expense', postExpense);
router.get('/expenses', fetchExpenses);

export default router;
