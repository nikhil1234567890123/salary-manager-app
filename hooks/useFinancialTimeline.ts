import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { generateFinancialTimeline } from '@/services/salaryAnalysisService';
import { analyzeMoneyMood } from '@/services/moneyMoodService';

export function useFinancialTimeline() {
    const { expenses, salary } = useFinance();
    const monthlySalary = salary?.monthlySalary ?? 0;
    const salaryDate = salary?.salaryCreditDate ?? 1;

    return useMemo(() => {
        const mood = analyzeMoneyMood(expenses, monthlySalary);
        return generateFinancialTimeline(expenses, monthlySalary, salaryDate, mood);
    }, [expenses, monthlySalary, salaryDate]);
}
