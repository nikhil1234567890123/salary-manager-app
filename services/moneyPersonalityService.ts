/**
 * Money Personality Analyzer Service
 * Assigns a financial personality based on behavior patterns.
 * Pure business logic — no UI dependencies.
 */

import { MoneyPersonality, PersonalityType } from '@/types/insights';

interface ExpenseRecord {
    amount: number;
    category: string;
    date: string;
}

/**
 * Analyze financial behavior and assign a Money Personality.
 *
 * Decision matrix:
 *  - The Planner:  Savings ratio > 30% AND consistent spending pattern
 *  - The Investor: Savings ratio > 40% (aggressive saver)
 *  - The Spender:  Spending > 80% of income AND high transaction frequency
 *  - The Survivor: Spending nearly matches income (85%+), low savings
 */
export function analyzeMoneyPersonality(
    expenses: ExpenseRecord[],
    monthlySalary: number,
    savingsAmount: number
): MoneyPersonality {
    if (monthlySalary <= 0) {
        return {
            personality: 'The Survivor',
            description: 'Add your salary details to discover your money personality.',
            emoji: '🛡️',
        };
    }

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const savingsRatio = savingsAmount / monthlySalary;
    const spendingRatio = totalSpent / monthlySalary;

    // Check spending consistency — coefficient of variation per day
    const daySpendMap = new Map<string, number>();
    expenses.forEach(e => {
        const key = e.date.split('T')[0];
        daySpendMap.set(key, (daySpendMap.get(key) || 0) + e.amount);
    });
    const dayAmounts = Array.from(daySpendMap.values());
    const isConsistent = dayAmounts.length > 0
        ? calculateCV(dayAmounts) < 50  // Low variation = consistent
        : true;

    // Transaction frequency (avg transactions per day)
    const uniqueDays = daySpendMap.size || 1;
    const txFrequency = expenses.length / uniqueDays;

    // ─── Decision logic ───────────────────────────────────────
    let personality: PersonalityType;
    let description: string;
    let emoji: string;

    if (savingsRatio >= 0.4) {
        personality = 'The Investor';
        description = `You save ${Math.round(savingsRatio * 100)}% of your income. You prioritize wealth-building and think long-term. Keep investing in your future!`;
        emoji = '📈';
    } else if (savingsRatio >= 0.25 && isConsistent) {
        personality = 'The Planner';
        description = 'You have a disciplined, methodical approach to money. Your spending is consistent and well-planned. Financial goals are within reach!';
        emoji = '📋';
    } else if (spendingRatio > 0.85) {
        personality = 'The Survivor';
        description = `You're using ${Math.round(spendingRatio * 100)}% of your income. Focus on building an emergency fund and reducing non-essential spending.`;
        emoji = '🛡️';
    } else if (spendingRatio > 0.7 && txFrequency > 3) {
        personality = 'The Spender';
        description = `You enjoy spending with ~${Math.round(txFrequency)} transactions per active day. Consider setting daily limits to build savings.`;
        emoji = '💳';
    } else {
        personality = 'The Planner';
        description = 'Your spending is moderate and balanced. You have room to grow your savings with small adjustments.';
        emoji = '📋';
    }

    return { personality, description, emoji };
}

/** Helper: Calculate coefficient of variation */
function calculateCV(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    if (mean === 0) return 0;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    return (Math.sqrt(variance) / mean) * 100;
}
