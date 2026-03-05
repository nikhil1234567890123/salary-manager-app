import { Request, Response } from 'express';
import { getSalary } from '../models/Salary';
import { getAllExpenses } from '../models/Expense';
import {
    calculateSavings,
    calculateTotalExpenses,
    calculateRemainingBalance,
    calculateDailySpending,
    calculateSpendableMoney,
    getRemainingDaysInMonth,
} from '../services/calculationService';

export function fetchDashboard(req: Request, res: Response): void {
    const salary = getSalary();

    if (!salary) {
        res.status(404).json({ error: 'Salary not configured. Please set salary first.' });
        return;
    }

    const expenses = getAllExpenses();
    const { monthlySalary, fixedExpenses, savingsRate } = salary;

    const savings = calculateSavings(monthlySalary, savingsRate);
    const totalExpenses = calculateTotalExpenses(expenses);
    const remainingBalance = calculateRemainingBalance(monthlySalary, fixedExpenses, savings, totalExpenses);
    const spendableMoney = calculateSpendableMoney(monthlySalary, fixedExpenses, savings);
    const remainingDays = getRemainingDaysInMonth();
    const dailySafeSpend = calculateDailySpending(spendableMoney - totalExpenses, remainingDays);

    res.json({
        monthlySalary,
        fixedExpenses,
        savingsRate,
        savings,
        totalExpenses,
        totalSaved: savings,
        remainingBalance,
        spendableMoney,
        dailySafeSpend,
        remainingDays,
        expenseCount: expenses.length,
    });
}
