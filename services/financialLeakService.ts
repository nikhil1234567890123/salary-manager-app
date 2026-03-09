/**
 * Financial Leak Detector Service
 * Identifies wasteful or unusually high spending categories relative to salary.
 * Pure business logic — no UI dependencies.
 */

import { FinancialLeak } from '@/types/insights';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseRecord {
    amount: number;
    category: string;
}

/** Threshold: flag categories consuming more than this % of salary */
const LEAK_THRESHOLD_PERCENT = 15;

/**
 * Detect "financial leaks" — categories where spending is disproportionately high.
 * Returns leaks sorted by severity (highest percentage first).
 */
export function detectFinancialLeaks(
    expenses: ExpenseRecord[],
    monthlySalary: number
): FinancialLeak[] {
    if (expenses.length === 0 || monthlySalary <= 0) return [];

    // Aggregate spending per category
    const categoryTotals = new Map<string, number>();
    expenses.forEach(e => {
        categoryTotals.set(e.category, (categoryTotals.get(e.category) || 0) + e.amount);
    });

    const leaks: FinancialLeak[] = [];

    categoryTotals.forEach((amount, category) => {
        const percentage = Math.round((amount / monthlySalary) * 100);

        if (percentage >= LEAK_THRESHOLD_PERCENT) {
            const halfAmount = Math.round(amount / 2);
            leaks.push({
                category,
                amount,
                percentageOfSalary: percentage,
                warning: `⚠️ Financial Leak Detected\nYou spent ₹${formatCurrency(amount)} on ${category} this month.\nThat is ${percentage}% of your salary.`,
                suggestion: `Reducing this by 50% could save ₹${formatCurrency(halfAmount)}.`,
            });
        }
    });

    // Sort by highest percentage first
    return leaks.sort((a, b) => b.percentageOfSalary - a.percentageOfSalary);
}
