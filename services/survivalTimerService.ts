/**
 * Salary Survival Timer Service
 * Calculates how long the current balance will last at the current spending rate.
 * Pure business logic — no UI dependencies.
 */

import { SurvivalTimer } from '@/types/insights';
import { formatCurrency } from '@/utils/formatters';

/**
 * Calculate survival metrics based on remaining balance and spending rate.
 *
 * @param remainingBalance - Current spendable balance
 * @param totalExpenses - Total spent so far this month
 * @param daysPassed - Number of days elapsed in the current billing cycle
 */
export function calculateSurvivalTimer(
    remainingBalance: number,
    totalExpenses: number,
    daysPassed: number
): SurvivalTimer {
    if (remainingBalance <= 0) {
        return {
            daysRemaining: 0,
            dailySafeLimit: 0,
            message: 'Your balance is exhausted. No spending room left this month.',
        };
    }

    // Calculate average daily spending rate
    const dailySpendRate = daysPassed > 0 ? totalExpenses / daysPassed : 0;

    // How many days can the remaining balance sustain at current rate
    const daysRemaining = dailySpendRate > 0
        ? Math.floor(remainingBalance / dailySpendRate)
        : 999; // Effectively infinite if no spending

    // Calculate a safe daily limit to stretch through remaining days
    // Use a conservative approach: even out remaining balance over projected days
    const remainingDaysInMonth = Math.max(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate(),
        1
    );
    const dailySafeLimit = Math.round(remainingBalance / remainingDaysInMonth);

    let message: string;
    if (daysRemaining >= 999) {
        message = 'No spending recorded yet — your balance is fully intact!';
    } else if (daysRemaining > 30) {
        message = `Your money will last for ${daysRemaining} days at your current spending rate. You're in great shape!`;
    } else if (daysRemaining > 15) {
        message = `Your money will last for ${daysRemaining} days at your current spending rate.`;
    } else if (daysRemaining > 5) {
        message = `⚠️ Your money will last only ${daysRemaining} days at your current spending rate. Consider reducing daily expenses.`;
    } else {
        message = `🚨 Critical: Your money will last only ${daysRemaining} days! Daily safe limit: ₹${formatCurrency(dailySafeLimit)}.`;
    }

    return { daysRemaining: Math.min(daysRemaining, 999), dailySafeLimit, message };
}
