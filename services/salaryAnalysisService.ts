/**
 * Salary Analysis & Timeline Service
 * Generates the chronologically ordered "Money Timeline" events based on
 * expenses and salary events.
 * Pure business logic — no UI dependencies.
 */

import { TimelineEvent, MoneyMood } from '@/types/insights';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseRecord {
    id: string;
    amount: number;
    category: string;
    date: string;
    note?: string;
}

export function generateFinancialTimeline(
    expenses: ExpenseRecord[],
    monthlySalary: number,
    salaryDate: number, // day of month 1-31
    moneyMood: MoneyMood | null
): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const now = new Date();

    // 1. Add Salary Credited Event (if the day has passed this month)
    const currentDay = now.getDate();
    if (currentDay >= salaryDate && monthlySalary > 0) {
        // Create date for the salary
        const salDate = new Date(now.getFullYear(), now.getMonth(), salaryDate);
        events.push({
            id: 'evt_salary',
            date: salDate.toISOString(),
            type: 'salary',
            title: 'Salary Credited',
            description: 'Your monthly income was added to your balance.',
            amount: monthlySalary,
            icon: 'wallet-outline',
            color: '#D3A77A'
        });
    }

    if (expenses.length > 0) {
        // Group by day to find highest spending day
        const dayMap = new Map<string, number>();
        let highestDay = '';
        let highestAmount = 0;

        expenses.forEach(e => {
            const d = e.date.split('T')[0];
            const current = (dayMap.get(d) || 0) + e.amount;
            dayMap.set(d, current);
            if (current > highestAmount) {
                highestAmount = current;
                highestDay = d;
            }
        });

        // 2. Highest Spending Day
        if (highestAmount > 0 && highestDay) {
            events.push({
                id: 'evt_highest_day',
                date: new Date(highestDay).toISOString(), // Roughly that day
                type: 'high_expense',
                title: 'Peak Spending Day',
                description: `You spent ₹${formatCurrency(highestAmount)} in a single day.`,
                amount: highestAmount,
                icon: 'trending-down-outline',
                color: '#EF6C6C'
            });
        }

        // 3. Very large individual expenses (e.g., > 20% of salary)
        const hugeThreshold = monthlySalary * 0.20;
        expenses.forEach(e => {
            if (e.amount > hugeThreshold) {
                events.push({
                    id: `evt_huge_${e.id}`,
                    date: e.date,
                    type: 'warning',
                    title: 'Large Expense Detected',
                    description: `${e.category} purchase (${e.note || 'No note'}) took a major chunk of your salary.`,
                    amount: e.amount,
                    icon: 'alert-circle-outline',
                    color: '#EFA46C'
                });
            }
        });

        // 4. Milestone: first expense of the month
        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sortedExpenses.length > 0) {
            events.push({
                id: 'evt_first_expense',
                date: sortedExpenses[0].date,
                type: 'milestone',
                title: 'First Expense of the Month',
                description: `Started the month with ${sortedExpenses[0].category}.`,
                amount: sortedExpenses[0].amount,
                icon: 'flag-outline',
                color: '#4FC1E8'
            });
        }
    }

    // 5. Add a "Money Mood" insight event tied to "today"
    if (moneyMood && expenses.length > 2) {
        events.push({
            id: 'evt_mood',
            date: now.toISOString(),
            type: 'insight',
            title: `Money Mood: ${moneyMood.mood}`,
            description: moneyMood.explanation,
            icon: 'analytics-outline',
            color: '#C47AE8' // Purple
        });
    }

    // Sort events by date descending (newest first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
