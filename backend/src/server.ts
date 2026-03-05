import express from 'express';
import cors from 'cors';
import salaryRoutes from './routes/salaryRoutes';
import expenseRoutes from './routes/expenseRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(salaryRoutes);
app.use(expenseRoutes);
app.use(dashboardRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Salary Manager API running on http://localhost:${PORT}`);
});

export default app;
