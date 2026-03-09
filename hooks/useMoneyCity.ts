import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { generateCityBuildings } from '@/services/moneyCityService';
import { CityBuildingData } from '@/types/money-city';

export function useMoneyCity(maxBuildingHeight: number = 200) {
    const { expenses, dashboardData } = useFinance();

    const totalSalary = dashboardData?.monthlySalary || 0;

    const buildings = useMemo(() => {
        return generateCityBuildings(expenses, totalSalary, maxBuildingHeight);
    }, [expenses, totalSalary, maxBuildingHeight]);

    return {
        buildings,
        totalSalary,
        totalSpent: dashboardData?.totalExpenses || 0,
        hasData: buildings.length > 0,
    };
}
