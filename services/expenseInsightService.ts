/**
 * Expense Insight Service — "Where Did My Money Go?"
 * Analyzes monthly expenses and generates AI-style readable summaries.
 * Pure business logic — no UI dependencies.
 */

import { ExpenseInsight, CategorySpend } from '@/types/insights';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseRecord {
    amount: number;
    category: string;
    note: string;
    date: string;
}

/**
 * Analyze expenses and produce a comprehensive insight.
 */
export function generateExpenseInsight(expenses: ExpenseRecord[]): ExpenseInsight {
    if (expenses.length === 0) {
        return {
            categoryBreakdown: [],
            highestCategory: null,
            mostUsedMerchant: null,
            mostExpensiveDay: null,
            summary: 'No expenses recorded this month. Start tracking to unlock insights!',
        };
    }

    // ─── 1. Category breakdown ────────────────────────────────
    const categoryMap = new Map<string, number>();
    expenses.forEach(e => {
        categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
    });

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const categoryBreakdown: CategorySpend[] = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

    const highestCategory = categoryBreakdown.length > 0
        ? { category: categoryBreakdown[0].category, amount: categoryBreakdown[0].amount }
        : null;

    // ─── 2. Most used merchant (extracted from notes) ─────────
    const merchantMap = new Map<string, number>();
    expenses.forEach(e => {
        const merchant = e.note?.trim() || 'Unknown';
        if (merchant !== 'Unknown' && merchant !== '') {
            merchantMap.set(merchant, (merchantMap.get(merchant) || 0) + 1);
        }
    });

    let mostUsedMerchant: { name: string; count: number } | null = null;
    if (merchantMap.size > 0) {
        const sorted = Array.from(merchantMap.entries()).sort((a, b) => b[1] - a[1]);
        mostUsedMerchant = { name: sorted[0][0], count: sorted[0][1] };
    }

    // ─── 3. Most expensive day ────────────────────────────────
    const dayMap = new Map<string, number>();
    expenses.forEach(e => {
        const dateKey = e.date.split('T')[0];
        dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + e.amount);
    });

    let mostExpensiveDay: { date: string; amount: number } | null = null;
    if (dayMap.size > 0) {
        const sorted = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1]);
        mostExpensiveDay = { date: sorted[0][0], amount: sorted[0][1] };
    }

    // ─── 4. Generate readable summary ─────────────────────────
    const parts: string[] = [];

    if (highestCategory) {
        parts.push(
            `You spent ₹${formatCurrency(highestCategory.amount)} on ${highestCategory.category} this month.`
        );
    }

    if (mostUsedMerchant) {
        parts.push(
            `Your most frequent platform was ${mostUsedMerchant.name} (${mostUsedMerchant.count} transactions).`
        );
    }

    if (mostExpensiveDay) {
        // Format date nicely
        const dateObj = new Date(mostExpensiveDay.date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            month: 'long',
            day: 'numeric',
        });
        parts.push(
            `Your most expensive day was ${formattedDate} at ₹${formatCurrency(mostExpensiveDay.amount)}.`
        );
    }

    const summary = parts.length > 0
        ? parts.join(' ')
        : 'Keep tracking expenses to unlock deeper insights.';

    return {
        categoryBreakdown,
        highestCategory,
        mostUsedMerchant,
        mostExpensiveDay,
        summary,
    };
}
