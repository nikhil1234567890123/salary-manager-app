/**
 * Money Mood Tracker Service
 * Determines the user's financial behavior mood from spending patterns.
 * Pure business logic — no UI dependencies.
 */

import { MoneyMood, MoneyMoodType } from '@/types/insights';

interface ExpenseRecord {
    amount: number;
    category: string;
    date: string;
}

/**
 * Analyze spending patterns and assign a financial mood.
 *
 * Heuristics:
 *  - Weekend Splurge: Weekend spending > 45% of total
 *  - Stress Spending: Sudden burst of 3+ transactions in one day
 *  - Overspending: Total spent > 80% of income
 *  - Balanced: None of the above triggers
 */
export function analyzeMoneyMood(
    expenses: ExpenseRecord[],
    monthlySalary: number
): MoneyMood {
    if (expenses.length === 0 || monthlySalary <= 0) {
        return {
            mood: 'Balanced',
            explanation: 'Not enough data yet. Keep tracking to discover your money mood!',
            emoji: '😌',
        };
    }

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    // ─── 1. Check spending vs income ratio ────────────────────
    const spendingRatio = totalSpent / monthlySalary;
    const isOverspending = spendingRatio > 0.8;

    // ─── 2. Check weekend spending proportion ─────────────────
    let weekendSpend = 0;
    let weekdaySpend = 0;
    expenses.forEach(e => {
        const day = new Date(e.date).getDay();
        if (day === 0 || day === 6) {
            weekendSpend += e.amount;
        } else {
            weekdaySpend += e.amount;
        }
    });
    const weekendProportion = totalSpent > 0 ? weekendSpend / totalSpent : 0;
    const isWeekendSplurge = weekendProportion > 0.45;

    // ─── 3. Check for spending bursts (stress indicator) ──────
    const dayTxCounts = new Map<string, number>();
    expenses.forEach(e => {
        const key = e.date.split('T')[0];
        dayTxCounts.set(key, (dayTxCounts.get(key) || 0) + 1);
    });
    const maxTxInDay = Math.max(...Array.from(dayTxCounts.values()), 0);
    const hasSpendingBurst = maxTxInDay >= 5;

    // ─── 4. Determine mood (priority order) ───────────────────
    let mood: MoneyMoodType;
    let explanation: string;
    let emoji: string;

    if (isOverspending) {
        mood = 'Overspending';
        explanation = `You've spent ${Math.round(spendingRatio * 100)}% of your salary. Consider slowing down to protect your savings.`;
        emoji = '😰';
    } else if (hasSpendingBurst) {
        mood = 'Stress Spending';
        explanation = `We noticed ${maxTxInDay} transactions in a single day — this pattern can indicate stress-driven spending.`;
        emoji = '😤';
    } else if (isWeekendSplurge) {
        mood = 'Weekend Splurge';
        explanation = `${Math.round(weekendProportion * 100)}% of your spending happened on weekends. Plan weekday activities to balance it out.`;
        emoji = '🎉';
    } else {
        mood = 'Balanced';
        explanation = 'Your spending pattern looks healthy and well-distributed. Keep it up!';
        emoji = '😌';
    }

    return { mood, explanation, emoji };
}
