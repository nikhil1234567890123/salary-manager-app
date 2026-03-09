/**
 * useFinancialInsights Hook
 * Composes all insight services into a single, memoized hook.
 * This is the single entry point for dashboard components to access all financial insights.
 */

import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { FinancialInsights } from '@/types/insights';

// Services
import { calculateStabilityScore, buildRecordsFromConfig } from '@/services/stabilityScoreService';
import { generateExpenseInsight } from '@/services/expenseInsightService';
import { analyzeMoneyMood } from '@/services/moneyMoodService';
import { detectFinancialLeaks } from '@/services/financialLeakService';
import { calculateSurvivalTimer } from '@/services/survivalTimerService';
import { simulateSavings } from '@/services/savingsSimulatorService';
import { analyzeMoneyPersonality } from '@/services/moneyPersonalityService';
import { generateMoneyRoast } from '@/services/moneyRoastService';

/**
 * Hook that computes all financial insights from the current finance context.
 * All values are memoized to avoid unnecessary recalculations.
 */
export function useFinancialInsights(): FinancialInsights {
    const { salary, expenses, dashboardData } = useFinance();

    const monthlySalary = salary?.monthlySalary ?? 0;
    const savingsAmount = dashboardData?.savings ?? 0;
    const remainingBalance = dashboardData?.remainingBalance ?? 0;
    const totalExpenses = dashboardData?.totalExpenses ?? 0;

    // 1. Salary Stability Score
    const stabilityScore = useMemo(() => {
        if (monthlySalary <= 0) return null;
        const records = buildRecordsFromConfig(monthlySalary);
        return calculateStabilityScore(records);
    }, [monthlySalary]);

    // 2. "Where Did My Money Go?" Insight
    const expenseInsight = useMemo(() => {
        return generateExpenseInsight(expenses);
    }, [expenses]);

    // 3. Money Mood Tracker
    const moneyMood = useMemo(() => {
        return analyzeMoneyMood(expenses, monthlySalary);
    }, [expenses, monthlySalary]);

    // 4. Financial Leak Detector
    const financialLeaks = useMemo(() => {
        return detectFinancialLeaks(expenses, monthlySalary);
    }, [expenses, monthlySalary]);

    // 5. Salary Survival Timer
    const survivalTimer = useMemo(() => {
        if (monthlySalary <= 0) return null;
        const daysPassed = Math.max(new Date().getDate(), 1);
        return calculateSurvivalTimer(remainingBalance, totalExpenses, daysPassed);
    }, [remainingBalance, totalExpenses, monthlySalary]);

    // 6. Future Savings Simulator
    const savingsProjections = useMemo(() => {
        if (!expenseInsight || expenseInsight.categoryBreakdown.length === 0) return [];
        return simulateSavings(expenseInsight.categoryBreakdown);
    }, [expenseInsight]);

    // 7. Money Personality Analyzer
    const moneyPersonality = useMemo(() => {
        return analyzeMoneyPersonality(expenses, monthlySalary, savingsAmount);
    }, [expenses, monthlySalary, savingsAmount]);

    // 8. AI Money Roast
    const moneyRoast = useMemo(() => {
        return generateMoneyRoast(expenses, monthlySalary);
    }, [expenses, monthlySalary]);

    return {
        stabilityScore,
        expenseInsight,
        moneyMood,
        financialLeaks,
        survivalTimer,
        savingsProjections,
        moneyPersonality,
        moneyRoast,
    };
}
