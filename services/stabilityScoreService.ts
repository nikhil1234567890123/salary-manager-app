/**
 * Salary Stability Score Service
 * Analyzes salary records to produce a 0–100 stability score.
 * Pure business logic — no UI dependencies.
 */

import { StabilityScore, VariationLevel } from '@/types/insights';

interface SalaryRecord {
    amount: number;
    month: string;
    year: number;
    /** Optional: expected credit date vs actual */
    expectedDate?: number;
    actualDate?: number;
}

/**
 * Calculate the coefficient of variation (CV) of an array of numbers.
 * CV = (std deviation / mean) * 100
 */
function coefficientOfVariation(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    if (mean === 0) return 0;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    return (Math.sqrt(variance) / mean) * 100;
}

/**
 * Map coefficient of variation to a variation level.
 */
function getVariationLevel(cv: number): VariationLevel {
    if (cv <= 5) return 'low';
    if (cv <= 15) return 'medium';
    return 'high';
}

/**
 * Calculate salary stability score from historical salary records.
 *
 * Scoring breakdown (100 total):
 *  - Consistency (40 pts): Based on coefficient of variation of amounts
 *  - Delay frequency (30 pts): Percentage of on-time payments
 *  - Amount variation (30 pts): Month-over-month change stability
 */
export function calculateStabilityScore(records: SalaryRecord[]): StabilityScore {
    if (records.length === 0) {
        return {
            score: 0,
            delayFrequency: 0,
            variationLevel: 'low',
            explanation: 'No salary records available. Add salary data to see your stability score.',
        };
    }

    const amounts = records.map(r => r.amount);

    // ─── 1. Consistency score (0–40) ───────────────────────────
    const cv = coefficientOfVariation(amounts);
    const variationLevel = getVariationLevel(cv);
    // Lower CV = higher score. CV of 0 = 40pts, CV of 30+ = 0pts
    const consistencyScore = Math.max(0, Math.round(40 * (1 - Math.min(cv, 30) / 30)));

    // ─── 2. Delay frequency score (0–30) ──────────────────────
    let delayCount = 0;
    records.forEach(r => {
        if (r.expectedDate && r.actualDate && r.actualDate > r.expectedDate) {
            delayCount++;
        }
    });
    const delayFrequency = records.length > 0 ? Math.round((delayCount / records.length) * 100) : 0;
    // Lower delay = higher score
    const delayScore = Math.max(0, Math.round(30 * (1 - delayFrequency / 100)));

    // ─── 3. Amount stability score (0–30) ─────────────────────
    // Measures month-over-month change
    let monthOverMonthChanges: number[] = [];
    for (let i = 1; i < amounts.length; i++) {
        if (amounts[i - 1] > 0) {
            const pctChange = Math.abs(amounts[i] - amounts[i - 1]) / amounts[i - 1] * 100;
            monthOverMonthChanges.push(pctChange);
        }
    }
    const avgChange = monthOverMonthChanges.length > 0
        ? monthOverMonthChanges.reduce((s, v) => s + v, 0) / monthOverMonthChanges.length
        : 0;
    // Lower avgChange = higher score. 0% change = 30pts, 25%+ change = 0pts
    const stabilityPoints = Math.max(0, Math.round(30 * (1 - Math.min(avgChange, 25) / 25)));

    const score = Math.min(100, consistencyScore + delayScore + stabilityPoints);

    // Generate explanation
    let explanation: string;
    if (score >= 85) {
        explanation = 'Excellent! Your salary is highly stable and consistent.';
    } else if (score >= 70) {
        explanation = 'Good stability. Your salary shows minor variations.';
    } else if (score >= 50) {
        explanation = 'Moderate stability. Consider checking for salary delays or fluctuations.';
    } else {
        explanation = 'Low stability. Your salary varies significantly month to month.';
    }

    return { score, delayFrequency, variationLevel, explanation };
}

/**
 * Convenience: Build SalaryRecord[] from the app's existing salary data.
 * Since the app currently stores one salary config (not monthly history),
 * this creates a simulated stable record from current config.
 */
export function buildRecordsFromConfig(
    monthlySalary: number,
    months: number = 6
): SalaryRecord[] {
    const records: SalaryRecord[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        records.push({
            amount: monthlySalary,
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear(),
        });
    }

    return records;
}
