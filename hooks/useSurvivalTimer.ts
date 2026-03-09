import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { calculateSurvivalTimer } from '@/services/survivalTimerService';

export function useSurvivalTimer() {
    const { salary, dashboardData } = useFinance();
    const monthlySalary = salary?.monthlySalary ?? 0;
    const remainingBalance = dashboardData?.remainingBalance ?? 0;
    const totalExpenses = dashboardData?.totalExpenses ?? 0;

    return useMemo(() => {
        if (monthlySalary <= 0) return null;
        const daysPassed = Math.max(new Date().getDate(), 1);
        return calculateSurvivalTimer(remainingBalance, totalExpenses, daysPassed);
    }, [remainingBalance, totalExpenses, monthlySalary]);
}
