/**
 * Insight Engine Service
 * Generates natural language summaries for the "AI Financial Brain".
 * Pure business logic — no UI dependencies.
 */

import { AIBrainSummary, SurvivalTimer } from '@/types/insights';

export function generateAIBrainSummary(
    totalExpenses: number,
    monthlySalary: number,
    survivalTimer: SurvivalTimer | null,
    highestCategory: { category: string; amount: number } | null
): AIBrainSummary {
    const messages: string[] = [];

    if (totalExpenses === 0) {
        messages.push("You haven't spent anything yet. Great start!");
        if (monthlySalary > 0) {
            messages.push("Track your first expense so I can start analyzing your habits.");
        }
        return { messages };
    }

    // Determine how much of the salary is spent
    const spentPercent = monthlySalary > 0 ? (totalExpenses / monthlySalary) * 100 : 0;

    if (spentPercent > 90) {
        messages.push("⚠️ Alert: You've spent over 90% of your income.");
    } else if (spentPercent > 50) {
        messages.push(`You've crossed ${Math.round(spentPercent)}% of your budget. Keep an eye on non-essentials.`);
    } else {
        messages.push(`You are doing well, having spent only ${Math.round(spentPercent)}% of your salary.`);
    }

    // Add highest category
    if (highestCategory) {
        messages.push(`Your biggest drain right now is ${highestCategory.category}.`);
    }

    // Add survival days
    if (survivalTimer) {
        if (survivalTimer.daysRemaining > 30) {
            messages.push("Your balance is extremely healthy and will comfortably last the month.");
        } else if (survivalTimer.daysRemaining < 7) {
            messages.push(`🚨 Your current balance will only last ${survivalTimer.daysRemaining} days at this rate!`);
        } else {
            messages.push(`At your current burn rate, your money will last ${survivalTimer.daysRemaining} days.`);
        }
    }

    return { messages };
}
