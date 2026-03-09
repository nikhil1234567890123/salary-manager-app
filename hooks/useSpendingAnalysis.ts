import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { generateUniversePlanets } from '@/services/expenseAnalysisService';

export function useSpendingAnalysis(maxUniverseRadius: number = 100) {
    const { expenses } = useFinance();

    return useMemo(() => {
        const planets = generateUniversePlanets(expenses, maxUniverseRadius);
        return {
            universePlanets: planets,
            totalActiveCategories: planets.length
        };
    }, [expenses, maxUniverseRadius]);
}
