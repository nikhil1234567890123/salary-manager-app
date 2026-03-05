import { Router } from 'express';
import { fetchDashboard } from '../controllers/dashboardController';

const router = Router();

router.get('/dashboard', fetchDashboard);

export default router;
