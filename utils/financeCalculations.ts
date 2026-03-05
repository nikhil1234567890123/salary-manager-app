export function calculateHealthScore(salary: number, spent: number, overspendDays: number): { score: number, message: string } {
    if (salary <= 0) return { score: 0, message: 'No salary data' };

    // Score deduction: 5 points per overspend day, plus proportional deduction based on total spent vs salary
    const score = Math.max(0, Math.min(100, 100 - (overspendDays * 5) - Math.floor((spent / salary) * 30)));

    let message = 'Consider cutting back on expenses.';
    if (score >= 80) message = 'Excellent discipline this month!';
    else if (score >= 50) message = 'Good progress, keep an eye on spending.';

    return { score, message };
}

export function calculateOverspendDays(expenses: { amount: number, date: string }[], dailyLimit: number): number {
    if (dailyLimit <= 0 || !expenses || expenses.length === 0) return 0;

    const expensesByDay = expenses.reduce<Record<string, number>>((acc, e) => {
        const dateKey = e.date.split('T')[0]; // Ensure just the date part if it's a full ISO string
        acc[dateKey] = (acc[dateKey] || 0) + e.amount;
        return acc;
    }, {});

    return Object.values(expensesByDay).filter(total => total > dailyLimit).length;
}

export function generateSmartInsights(
    remainingBalance: number,
    dailyLimit: number,
    spentToday: number,
    overspendDays: number
): { type: 'success' | 'warning' | 'danger', text: string }[] {
    const insights: { type: 'success' | 'warning' | 'danger', text: string }[] = [];

    // Daily Insight
    if (spentToday > dailyLimit && dailyLimit > 0) {
        insights.push({ type: 'danger', text: `You spent more than your safe daily limit today (₹${spentToday} vs ₹${dailyLimit}).` });
    } else if (spentToday > 0) {
        insights.push({ type: 'success', text: `You are spending within your safe limit today. Great job!` });
    } else {
        insights.push({ type: 'success', text: `You haven't spent anything today. Keep it up!` });
    }

    // Overspend Days Insight
    if (overspendDays > 0) {
        insights.push({ type: 'warning', text: `You exceeded your daily limit ${overspendDays} times this month. Try cooking at home tomorrow to balance it out.` });
    } else if (dailyLimit > 0) {
        insights.push({ type: 'success', text: `Perfect record! You haven't exceeded your daily limit this month.` });
    }

    // Balance Insight
    if (remainingBalance < 0) {
        insights.push({ type: 'danger', text: `You have exhausted your spendable balance for the month.` });
    }

    return insights;
}
