import { CityBuildingData } from '@/types/money-city';
import { Expense, CATEGORY_COLORS } from '@/utils/analyticsEngine';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    Food: 'fast-food-outline',
    Transport: 'car-outline',
    Shopping: 'bag-outline',
    Bills: 'receipt-outline',
    Health: 'medkit-outline',
    Entertainment: 'game-controller-outline',
    Education: 'school-outline',
    Other: 'ellipsis-horizontal-outline',
    General: 'wallet-outline',
};

/**
 * Transforms raw expenses and salary into building data for the Money City visualization.
 */
export function generateCityBuildings(
    expenses: Expense[],
    totalSalary: number,
    maxBuildingHeight: number
): CityBuildingData[] {
    if (expenses.length === 0) return [];

    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach((e) => {
        const current = categoryMap.get(e.category) || { amount: 0, count: 0 };
        categoryMap.set(e.category, {
            amount: current.amount + e.amount,
            count: current.count + 1,
        });
    });

    const sortedCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
            category,
            amount: data.amount,
            count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount);

    if (sortedCategories.length === 0) return [];

    // Max amount used for normalization (tallest building relative to budget or biggest spend)
    // We cap the tallest building at the max building height.
    const maxSpend = sortedCategories[0].amount;

    // Base height factor: 
    // If we want height to be proportional to salary, we could use that.
    // But usually, it's better to scale relative to the biggest building to ensure visibility.
    // We'll use a mix: scale relative to maxSpend, but show percentage of salary.

    return sortedCategories.map((cat, index) => {
        const percentage = totalSalary > 0 ? (cat.amount / totalSalary) * 100 : 0;

        // Height normalization: biggest spend gets 100% of maxBuildingHeight
        // Smaller gets proportionally less, but with a minimum height for visibility
        const heightRatio = cat.amount / maxSpend;
        const height = Math.max(0.1, heightRatio) * maxBuildingHeight;

        return {
            id: `building-${cat.category}-${index}`,
            category: cat.category,
            amount: cat.amount,
            height,
            percentage,
            transactionCount: cat.count,
            color: CATEGORY_COLORS[cat.category] || '#65625E',
            icon: CATEGORY_ICONS[cat.category] || 'wallet-outline',
        };
    });
}
