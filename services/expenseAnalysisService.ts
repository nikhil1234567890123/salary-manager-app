/**
 * Expense Analysis Service
 * Processes expense data specifically for visualizing the Space/Universe orbital UI.
 * Pure business logic — no UI dependencies.
 */

import { PlanetCategory } from '@/types/insights';
import { CATEGORY_COLORS } from '@/utils/analyticsEngine';

interface ExpenseRecord {
    amount: number;
    category: string;
}

export function generateUniversePlanets(expenses: ExpenseRecord[], maxRadius: number): PlanetCategory[] {
    if (expenses.length === 0) return [];

    const categoryMap = new Map<string, number>();
    let totalSpend = 0;

    expenses.forEach(e => {
        categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
        totalSpend += e.amount;
    });

    if (totalSpend === 0) return [];

    // Convert to array and sort by amount descending
    const sortedCategories = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);


    const planets: PlanetCategory[] = [];

    // Space the orbits incrementally but reserve MORE space for the sun + planet + label
    const centerAvoidance = 45; // Minimum distance to clear the Sun
    const edgeAvoidance = 35; // Space for labels at the edge

    // Effective usable area for rings
    const effectiveRadiusSpace = Math.max(0, maxRadius - centerAvoidance - edgeAvoidance);

    // If we have categories, space their rings evenly
    const orbitGap = sortedCategories.length > 0 ? effectiveRadiusSpace / sortedCategories.length : 0;

    // Find the max amount to normalize planet sizes
    const maxAmount = sortedCategories[0].amount;

    sortedCategories.forEach((cat, index) => {
        // Size ratio relative to biggest category (min 10% size)
        const sizeRatio = Math.max(0.15, cat.amount / maxAmount);

        // Cap maximum size significantly to prevent overlap.
        const planetRadius = sizeRatio * 16;

        // Start from center avoidance, go outwards.
        const orbitRadius = centerAvoidance + (orbitGap * (index + 1)) - (orbitGap / 2);

        planets.push({
            category: cat.category,
            amount: cat.amount,
            radius: Math.max(8, planetRadius), // Minimum radius
            color: CATEGORY_COLORS[cat.category] || '#65625E',
            orbitRadius: orbitRadius,
            speed: 5000 + (index * 2500), // Slightly slow down outer planets
        });
    });

    return planets;
}
