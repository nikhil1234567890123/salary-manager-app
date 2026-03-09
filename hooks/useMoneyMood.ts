import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { analyzeMoneyMood } from '@/services/moneyMoodService';

export function useMoneyMood() {
    const { expenses, salary } = useFinance();
    const monthlySalary = salary?.monthlySalary ?? 0;

    return useMemo(() => {
        return analyzeMoneyMood(expenses, monthlySalary);
    }, [expenses, monthlySalary]);
}
