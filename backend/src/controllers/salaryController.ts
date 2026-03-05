import { Request, Response } from 'express';
import { getSalary, setSalary } from '../models/Salary';

export function postSalary(req: Request, res: Response): void {
    const { monthlySalary, fixedExpenses, savingsRate } = req.body;

    if (!monthlySalary || monthlySalary <= 0) {
        res.status(400).json({ error: 'monthlySalary is required and must be positive' });
        return;
    }

    if (fixedExpenses === undefined || fixedExpenses < 0) {
        res.status(400).json({ error: 'fixedExpenses is required and cannot be negative' });
        return;
    }

    const salary = setSalary({
        monthlySalary,
        fixedExpenses,
        savingsRate: savingsRate ?? 0.2,
    });

    res.status(201).json(salary);
}

export function fetchSalary(req: Request, res: Response): void {
    const salary = getSalary();
    if (!salary) {
        res.status(404).json({ error: 'Salary data not configured yet' });
        return;
    }
    res.json(salary);
}
