/**
 * Financial Analysis Service
 * Calculates the aggregate 0-100 "Financial Health Score".
 * Combines stability, spending control, savings ratio, and financial risk profiles.
 * Pure business logic — no UI dependencies.
 */

import { FinancialHealthScore, RadarMetrics } from '@/types/insights';

export function calculateFinancialHealthScore(
    stabilityScore: number,
    totalExpenses: number,
    monthlySalary: number,
    savingsAmount: number
): FinancialHealthScore {
    // 1. Stability (passed in from existing service)
    const stability = stabilityScore;

    // 2. Spending Control (0-100)
    // Higher score if they spend a lower percentage of their salary.
    // 0% spent = 100, 100% spent = 0. Cap at 0 and 100.
    const spendingRatio = monthlySalary > 0 ? totalExpenses / monthlySalary : 1;
    let control = Math.max(0, 100 - (spendingRatio * 100));
    // If spending > 100%, score drops to 0.

    // 3. Savings Strength (0-100)
    // Formula: 20% savings = 100 score. 0% savings = 0 score.
    const savingsRatio = monthlySalary > 0 ? savingsAmount / monthlySalary : 0;
    let savings = Math.min(100, (savingsRatio / 0.20) * 100);

    // 4. Money Mood mapping to metric (0-100)
    // Because we just need a number for the radar, we approximate it.
    // For simplicity, we just base it heavily on control & savings.
    const moodScore = (control + savings) / 2;

    // 5. Financial Risk (0-100, but inverted so 100 means 'Low Risk' for radar visualization)
    // If you spend near your limit and save little, risk is high (score is low).
    // Risk score = (100 - control) * 0.7 + (100 - savings) * 0.3;
    // That gives 0 for safe, 100 for risky. We invert it.
    let riskRaw = (100 - control) * 0.7 + (100 - savings) * 0.3;
    let riskScore = Math.max(0, 100 - riskRaw);

    // Aggregate overall score (Weighted average)
    // 30% Stability, 30% Control, 20% Savings, 20% Risk Management
    const overallScore = Math.round(
        (stability * 0.3) +
        (control * 0.3) +
        (savings * 0.2) +
        (riskScore * 0.2)
    );

    let color = '#EF6C6C'; // red
    let label = 'Critical';

    if (overallScore >= 80) {
        color = '#6CEF8A'; // green
        label = 'Excellent';
    } else if (overallScore >= 60) {
        color = '#EACFA7'; // gold
        label = 'Good';
    } else if (overallScore >= 40) {
        color = '#EFA46C'; // orange
        label = 'Fair';
    }

    const metrics: RadarMetrics = {
        stability: Math.round(stability),
        control: Math.round(control),
        savings: Math.round(savings),
        moodScore: Math.round(moodScore),
        risk: Math.round(riskScore)
    };

    return {
        score: overallScore,
        label,
        color,
        metrics
    };
}
