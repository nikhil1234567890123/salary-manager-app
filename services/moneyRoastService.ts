/**
 * AI Money Roast Service
 * Generates fun, lighthearted roast messages for excessive spending.
 * Rule-based template system — no external AI dependency.
 */

import { MoneyRoast } from '@/types/insights';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseRecord {
    amount: number;
    category: string;
}

/** Threshold: roast categories exceeding this % of salary */
const ROAST_THRESHOLD_PERCENT = 12;

/** Roast template library, keyed by category */
const ROAST_TEMPLATES: Record<string, string[]> = {
    Food: [
        "Bro you spent ₹{amount} on food this month. Are you feeding yourself or the whole neighborhood? 🍕",
        "₹{amount} on food?! At this rate, you could open your own restaurant. 🍽️",
        "Your food bill is ₹{amount}. Gordon Ramsay would be proud... or concerned. 👨‍🍳",
    ],
    Transport: [
        "₹{amount} on transport? Are you taking a helicopter to work? 🚁",
        "You spent ₹{amount} getting around. Maybe consider teleportation? 🌀",
        "₹{amount} on transport! You could've bought a bicycle fleet by now. 🚲",
    ],
    Shopping: [
        "₹{amount} on shopping?! Your cart is heavier than your wallet. 🛒",
        "You spent ₹{amount} shopping. The sale was *on the items*, not on your savings. 🏷️",
        "₹{amount} on shopping? Amazon should give you a VIP parking spot. 📦",
    ],
    Entertainment: [
        "₹{amount} on entertainment? You're living like a Bollywood star on a stipend budget. 🎬",
        "You spent ₹{amount} on fun. Your bank account is NOT having fun though. 🎮",
        "₹{amount} on entertainment! Netflix, chill, and... bankruptcy? 📺",
    ],
    Bills: [
        "₹{amount} on bills?! Your bills have bills at this point. 📄",
        "You spent ₹{amount} on bills. Even the electricity board is impressed. ⚡",
    ],
    Health: [
        "₹{amount} on health? At least your body is getting more investment than your savings. 💪",
        "You spent ₹{amount} on health. Stay healthy, but maybe find a cheaper gym? 🏋️",
    ],
};

/** Generic roasts for unlisted categories */
const GENERIC_ROASTS: string[] = [
    "₹{amount} on {category}? That's a whole personality trait at this point. 😅",
    "You spent ₹{amount} on {category}. Your wallet just filed for emotional support. 💸",
    "₹{amount} on {category}?! Even your future self is judging you right now. 🔮",
];

/**
 * Generate a roast for the highest-spending category that exceeds the threshold.
 * Returns null if no category triggers a roast.
 */
export function generateMoneyRoast(
    expenses: ExpenseRecord[],
    monthlySalary: number
): MoneyRoast | null {
    if (expenses.length === 0 || monthlySalary <= 0) return null;

    // Aggregate per category
    const categoryTotals = new Map<string, number>();
    expenses.forEach(e => {
        categoryTotals.set(e.category, (categoryTotals.get(e.category) || 0) + e.amount);
    });

    // Find highest spender that exceeds threshold
    let topCategory: string | null = null;
    let topAmount = 0;

    categoryTotals.forEach((amount, category) => {
        const percentage = (amount / monthlySalary) * 100;
        if (percentage >= ROAST_THRESHOLD_PERCENT && amount > topAmount) {
            topCategory = category;
            topAmount = amount;
        }
    });

    if (!topCategory) return null;

    // Pick a random roast template
    const templates = ROAST_TEMPLATES[topCategory] || GENERIC_ROASTS;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const roast = template
        .replace(/\{amount\}/g, formatCurrency(topAmount))
        .replace(/\{category\}/g, topCategory);

    return {
        category: topCategory,
        amount: topAmount,
        roast,
    };
}
