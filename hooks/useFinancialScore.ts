import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { calculateFinancialHealthScore } from '@/services/financialAnalysisService';
import { calculateStabilityScore, buildRecordsFromConfig } from '@/services/stabilityScoreService';

export function useFinancialScore() {
    const { salary, dashboardData } = useFinance();

    const monthlySalary = salary?.monthlySalary ?? 0;
    const totalExpenses = dashboardData?.totalExpenses ?? 0;
    const savingsAmount = dashboardData?.savings ?? 0;

    return useMemo(() => {
        if (monthlySalary <= 0) return null;

        // Get inner stability score first
        const records = buildRecordsFromConfig(monthlySalary);
        const stabilityReturn = calculateStabilityScore(records);

        // Aggregate to the overall visual health score + radar metrics
        return calculateFinancialHealthScore(
            stabilityReturn.score,
            totalExpenses,
            monthlySalary,
            savingsAmount
        );
    }, [monthlySalary, totalExpenses, savingsAmount]);
}
