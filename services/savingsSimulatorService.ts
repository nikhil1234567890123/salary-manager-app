/**
 * Future Savings Simulator Service
 * Simulates financial decisions and projects yearly savings.
 * Pure business logic — no UI dependencies.
 */

import { SavingsProjection } from '@/types/insights';
import { formatCurrency } from '@/utils/formatters';

interface CategorySpending {
    category: string;
    amount: number;
}

/**
 * Generate savings projections for the top spending categories.
 * For each category, simulates a 50% reduction and projects annual savings.
 *
 * @param categorySpending - Array of { category, amount } for the current month
 * @param maxProjections - Max number of projections to return (default: 3)
 */
export function simulateSavings(
    categorySpending: CategorySpending[],
    maxProjections: number = 3
): SavingsProjection[] {
    if (categorySpending.length === 0) return [];

    // Sort by amount descending and take top N
    const sorted = [...categorySpending].sort((a, b) => b.amount - a.amount);
    const topCategories = sorted.slice(0, maxProjections);

    return topCategories.map(cat => {
        // Simulate 50% reduction
        const monthlyReduction = Math.round(cat.amount / 2);
        const yearlySavings = monthlyReduction * 12;

        // Generate chart data (cumulative monthly savings over 12 months)
        const chartData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            savings: monthlyReduction * (i + 1),
        }));

        return {
            category: cat.category,
            monthlyReduction,
            yearlySavings,
            message: `If you reduce ${cat.category} spending by ₹${formatCurrency(monthlyReduction)}/month\nYou will save ₹${formatCurrency(yearlySavings)} in one year.`,
            chartData,
        };
    });
}
