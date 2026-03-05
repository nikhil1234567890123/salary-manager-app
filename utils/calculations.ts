/**
 * Reusable calculation utility functions for the Salary Manager app.
 * These mirror the backend calculationService.ts for offline/local use.
 */

/**
 * Calculate savings amount from salary
 */
export function calculateSavings(monthlySalary: number, savingsRate: number = 0.2): number {
    return Math.round(monthlySalary * savingsRate);
}

/**
 * Calculate total expenses from an expense list
 */
export function calculateTotalExpenses(expenses: { amount: number }[]): number {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

/**
 * Calculate remaining balance after fixed expenses, savings, and variable expenses
 */
export function calculateRemainingBalance(
    monthlySalary: number,
    fixedExpenses: number,
    savings: number,
    totalExpenses: number
): number {
    return monthlySalary - fixedExpenses - savings - totalExpenses;
}

/**
 * Calculate daily safe spending limit
 */
export function calculateDailySpending(spendableMoney: number, remainingDays: number): number {
    if (remainingDays <= 0) return 0;
    return Math.round(Math.max(spendableMoney, 0) / remainingDays);
}

/**
 * Get the number of remaining days in the current month
 */
export function getRemainingDaysInMonth(): number {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.max(lastDay - now.getDate(), 1);
}

/**
 * Calculate spendable money (salary - fixed expenses - savings)
 */
export function calculateSpendableMoney(
    monthlySalary: number,
    fixedExpenses: number,
    savings: number
): number {
    return monthlySalary - fixedExpenses - savings;
}
