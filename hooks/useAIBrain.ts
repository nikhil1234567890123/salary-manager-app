import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { calculateSurvivalTimer } from '@/services/survivalTimerService';
import { generateExpenseInsight } from '@/services/expenseInsightService';
import { generateAIBrainSummary } from '@/services/insightEngineService';

export function useAIBrain() {
    const { salary, expenses, dashboardData } = useFinance();
    const monthlySalary = salary?.monthlySalary ?? 0;
    const totalExpenses = dashboardData?.totalExpenses ?? 0;
    const remainingBalance = dashboardData?.remainingBalance ?? 0;

    return useMemo(() => {
        const daysPassed = Math.max(new Date().getDate(), 1);
        const survival = calculateSurvivalTimer(remainingBalance, totalExpenses, daysPassed);
        const insight = generateExpenseInsight(expenses);

        return generateAIBrainSummary(
            totalExpenses,
            monthlySalary,
            survival,
            insight.highestCategory
        );
    }, [expenses, monthlySalary, totalExpenses, remainingBalance]);
}
