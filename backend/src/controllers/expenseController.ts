import { Request, Response } from 'express';
import { getAllExpenses, addExpense } from '../models/Expense';

export function postExpense(req: Request, res: Response): void {
    const { amount, category, note, date } = req.body;

    if (!amount || amount <= 0) {
        res.status(400).json({ error: 'amount is required and must be positive' });
        return;
    }

    if (!category || category.trim() === '') {
        res.status(400).json({ error: 'category is required' });
        return;
    }

    const expense = addExpense({
        amount,
        category: category.trim(),
        note: note || '',
        date: date || new Date().toISOString().split('T')[0],
    });

    res.status(201).json(expense);
}

export function fetchExpenses(req: Request, res: Response): void {
    const expenses = getAllExpenses();
    res.json(expenses);
}
