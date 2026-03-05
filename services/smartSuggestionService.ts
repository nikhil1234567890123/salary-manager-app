/**
 * Smart Suggestion Service (iOS / All Platforms)
 *
 * Since iOS does not allow SMS access, this service generates
 * expense suggestions based on user behavior and past patterns.
 *
 * Strategies:
 *   1. Recurring merchants — same merchant appears multiple times
 *   2. Time-of-day patterns — expenses that repeat at similar times
 *   3. Day-of-week patterns — expenses on the same weekday
 *   4. Amount patterns — similar amounts for the same merchant
 */

import { SmartSuggestion } from '@/models/detectedTransaction';
import { Expense } from '@/context/FinanceContext';
import { detectCategory } from '@/utils/merchantCategoryMap';

/** Maximum number of suggestions to return */
const MAX_SUGGESTIONS = 3;

/** Minimum occurrences of a pattern to trigger a suggestion */
const MIN_PATTERN_COUNT = 2;

/** How many days back to analyze for patterns */
const ANALYSIS_WINDOW_DAYS = 30;

interface MerchantPattern {
    merchant: string;
    category: string;
    averageAmount: number;
    occurrences: number;
    lastDate: string;
    dayOfWeekCounts: Record<number, number>; // 0=Sun, 6=Sat
}

/**
 * Analyze expense history and extract merchant patterns.
 */
function analyzePatterns(expenses: Expense[]): MerchantPattern[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ANALYSIS_WINDOW_DAYS);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Filter to recent expenses only
    const recent = expenses.filter((e) => e.date >= cutoffStr);

    // Group by note (as merchant proxy) or category
    const merchantMap = new Map<string, {
        amounts: number[];
        category: string;
        dates: string[];
        dayOfWeekCounts: Record<number, number>;
    }>();

    for (const expense of recent) {
        // Use note as merchant identifier; fall back to category
        const key = expense.note?.trim()
            ? expense.note.trim().toLowerCase()
            : expense.category.toLowerCase();

        if (!merchantMap.has(key)) {
            merchantMap.set(key, {
                amounts: [],
                category: expense.category,
                dates: [],
                dayOfWeekCounts: {},
            });
        }

        const entry = merchantMap.get(key)!;
        entry.amounts.push(expense.amount);
        entry.dates.push(expense.date);

        const dayOfWeek = new Date(expense.date).getDay();
        entry.dayOfWeekCounts[dayOfWeek] = (entry.dayOfWeekCounts[dayOfWeek] || 0) + 1;
    }

    // Convert to patterns
    const patterns: MerchantPattern[] = [];

    for (const [merchant, data] of merchantMap.entries()) {
        if (data.amounts.length < MIN_PATTERN_COUNT) continue;

        const avgAmount = Math.round(
            data.amounts.reduce((sum, a) => sum + a, 0) / data.amounts.length
        );

        // Sort dates to find the most recent
        const sortedDates = [...data.dates].sort().reverse();

        patterns.push({
            merchant,
            category: data.category || detectCategory(merchant),
            averageAmount: avgAmount,
            occurrences: data.amounts.length,
            lastDate: sortedDates[0],
            dayOfWeekCounts: data.dayOfWeekCounts,
        });
    }

    // Sort by occurrences descending
    return patterns.sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Check if today matches a pattern's typical day of week.
 */
function isTodayAPatternDay(pattern: MerchantPattern): boolean {
    const today = new Date().getDay();
    const count = pattern.dayOfWeekCounts[today] || 0;
    return count >= Math.ceil(pattern.occurrences * 0.3); // 30%+ of expenses on this day
}

/**
 * Check if the pattern was already used today.
 */
function wasUsedToday(pattern: MerchantPattern, todayStr: string): boolean {
    return pattern.lastDate === todayStr;
}

/**
 * Generate a human-readable display message for a suggestion.
 */
function buildDisplayMessage(merchant: string, amount: number): string {
    // Capitalize merchant name
    const displayName = merchant
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const messages = [
        `Did you spend ₹${amount.toLocaleString('en-IN')} on ${displayName} today?`,
        `Add your recent ${displayName} payment ₹${amount.toLocaleString('en-IN')}?`,
        `₹${amount.toLocaleString('en-IN')} at ${displayName} — add to expenses?`,
    ];

    // Pick a message variant based on the merchant name hash
    let hash = 0;
    for (let i = 0; i < merchant.length; i++) {
        hash = ((hash << 5) - hash + merchant.charCodeAt(i)) & 0xffffffff;
    }
    return messages[Math.abs(hash) % messages.length];
}

/**
 * Generate smart expense suggestions based on past behavior.
 *
 * @param expenses - Full expense history from FinanceContext
 * @returns Up to MAX_SUGGESTIONS suggestions
 */
export function generateSuggestions(expenses: Expense[]): SmartSuggestion[] {
    if (expenses.length < MIN_PATTERN_COUNT) {
        return [];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const patterns = analyzePatterns(expenses);
    const suggestions: SmartSuggestion[] = [];

    for (const pattern of patterns) {
        if (suggestions.length >= MAX_SUGGESTIONS) break;

        // Skip if already used today
        if (wasUsedToday(pattern, todayStr)) continue;

        // Calculate confidence based on frequency and day-of-week match
        let confidence = Math.min(pattern.occurrences / 10, 0.6); // Base: up to 0.6
        if (isTodayAPatternDay(pattern)) {
            confidence += 0.3; // Day-of-week bonus
        }
        confidence = Math.min(confidence, 1.0);

        // Only suggest if confidence is reasonable
        if (confidence < 0.3) continue;

        suggestions.push({
            id: `suggestion_${pattern.merchant}_${todayStr}`,
            amount: pattern.averageAmount,
            merchant: pattern.merchant
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' '),
            category: pattern.category,
            displayMessage: buildDisplayMessage(pattern.merchant, pattern.averageAmount),
            confidence,
            date: todayStr,
        });
    }

    // Sort by confidence descending
    return suggestions.sort((a, b) => b.confidence - a.confidence);
}
