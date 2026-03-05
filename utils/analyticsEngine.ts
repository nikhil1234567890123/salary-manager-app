/**
 * Advanced Financial Analytics Engine
 * Pure TypeScript utility — no UI code. All functions are reusable and testable.
 */

// ─── Types ────────────────────────────────────────────────────
import { formatCurrency } from './formatters';

export interface Expense {
    id: string;
    amount: number;
    category: string;
    note: string;
    date: string;  // ISO or YYYY-MM-DD
}

export interface BurnRate {
    dailyBurnRate: number;          // ₹ per day (actual)
    safeDailyLimit: number;         // ₹ per day (ideal)
    burnRatio: number;              // >1 means overspending
    status: 'safe' | 'warning' | 'danger';
}

export interface SpendingPrediction {
    projectedMonthlySpending: number;
    projectedMonthlySavings: number;
    message: string;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

export interface SpendingBehavior {
    highestSpendingDay: { day: string; amount: number } | null;
    mostExpensiveCategory: { category: string; amount: number } | null;
    weekendSpending: number;
    weekdaySpending: number;
    weekendVsWeekday: 'weekend-heavy' | 'weekday-heavy' | 'balanced';
    avgTransactionSize: number;
    totalTransactions: number;
}

export interface WeeklyDisciplineScore {
    score: number;             // 0–100
    label: string;             // e.g. "Good discipline"
    overspendPenalty: number;
    savingBonus: number;
    frequencyPenalty: number;
}

export type InsightType = 'success' | 'warning' | 'danger' | 'info';

export interface SmartInsight {
    type: InsightType;
    title: string;
    text: string;
    icon: string;  // Ionicons name
}

// ─── Helpers ──────────────────────────────────────────────────
function getDaysInMonth(date = new Date()): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getDaysPassed(date = new Date()): number {
    return Math.max(date.getDate(), 1);
}

function getRemainingDays(date = new Date()): number {
    return Math.max(getDaysInMonth(date) - date.getDate(), 1);
}

function toDateKey(d: string): string {
    return d.split('T')[0];
}

function getDayOfWeek(d: string): number {
    return new Date(d).getDay(); // 0=Sun, 6=Sat
}

function isWeekend(d: string): boolean {
    const day = getDayOfWeek(d);
    return day === 0 || day === 6;
}

// ─── 1. Burn Rate ─────────────────────────────────────────────
export function calculateBurnRate(
    totalExpenses: number,
    safeDailyLimit: number,
    now = new Date()
): BurnRate {
    const daysPassed = getDaysPassed(now);
    const dailyBurnRate = Math.round(totalExpenses / daysPassed);
    const burnRatio = safeDailyLimit > 0 ? +(dailyBurnRate / safeDailyLimit).toFixed(2) : 0;
    const status: BurnRate['status'] =
        burnRatio <= 1 ? 'safe' : burnRatio <= 1.3 ? 'warning' : 'danger';

    return { dailyBurnRate, safeDailyLimit, burnRatio, status };
}

// ─── 2. End-of-Month Prediction ──────────────────────────────
export function predictEndOfMonth(
    totalExpenses: number,
    spendableMoney: number,
    savings: number,
    now = new Date()
): SpendingPrediction {
    const daysPassed = getDaysPassed(now);
    const daysInMonth = getDaysInMonth(now);
    const dailyRate = totalExpenses / daysPassed;
    const projectedMonthlySpending = Math.round(dailyRate * daysInMonth);
    const projectedMonthlySavings = Math.max(0, Math.round(spendableMoney - projectedMonthlySpending + savings));

    let message: string;
    if (projectedMonthlySavings > savings) {
        message = `At your current pace you will save ₹${formatCurrency(projectedMonthlySavings)} this month — great job!`;
    } else if (projectedMonthlySavings > 0) {
        message = `At your current pace you will save ₹${formatCurrency(projectedMonthlySavings)} this month.`;
    } else {
        message = `At your current pace you may overspend your budget this month.`;
    }

    return { projectedMonthlySpending, projectedMonthlySavings, message };
}

// ─── 3. Weekly Financial Discipline Score ────────────────────
export function calculateDisciplineScore(
    expenses: Expense[],
    dailyLimit: number,
    salary: number,
    totalExpenses: number
): WeeklyDisciplineScore {
    if (salary <= 0 || dailyLimit <= 0) {
        return { score: 0, label: 'No data', overspendPenalty: 0, savingBonus: 0, frequencyPenalty: 0 };
    }

    // --- Overspend penalty (max –40) ---
    const byDay = expenses.reduce<Record<string, number>>((acc, e) => {
        const key = toDateKey(e.date);
        acc[key] = (acc[key] || 0) + e.amount;
        return acc;
    }, {});
    const overspendCount = Object.values(byDay).filter(v => v > dailyLimit).length;
    const overspendPenalty = Math.min(overspendCount * 8, 40);

    // --- Savings bonus (max +30) ---
    const savingsRatio = Math.max(0, 1 - totalExpenses / salary);
    const savingBonus = Math.round(savingsRatio * 30);

    // --- Frequency penalty (max –30): too many small transactions per day ---
    const txPerDay = Object.keys(byDay).length > 0
        ? expenses.length / Object.keys(byDay).length
        : 0;
    const frequencyPenalty = txPerDay > 5 ? 20 : txPerDay > 3 ? 10 : 0;

    const score = Math.max(0, Math.min(100, 100 - overspendPenalty + savingBonus - frequencyPenalty));

    let label = 'Needs improvement';
    if (score >= 85) label = 'Excellent discipline';
    else if (score >= 70) label = 'Good discipline';
    else if (score >= 50) label = 'Fair discipline';

    return { score, label, overspendPenalty, savingBonus, frequencyPenalty };
}

// ─── 4. Spending Behaviour Analysis ─────────────────────────
export function analyzeSpendingBehavior(expenses: Expense[]): SpendingBehavior {
    if (expenses.length === 0) {
        return {
            highestSpendingDay: null,
            mostExpensiveCategory: null,
            weekendSpending: 0,
            weekdaySpending: 0,
            weekendVsWeekday: 'balanced',
            avgTransactionSize: 0,
            totalTransactions: 0,
        };
    }

    // Highest spending day
    const byDay = expenses.reduce<Record<string, number>>((acc, e) => {
        const key = toDateKey(e.date);
        acc[key] = (acc[key] || 0) + e.amount;
        return acc;
    }, {});
    const sortedDays = Object.entries(byDay).sort((a, b) => b[1] - a[1]);
    const highestSpendingDay = sortedDays[0]
        ? { day: sortedDays[0][0], amount: sortedDays[0][1] }
        : null;

    // Most expensive category
    const byCat = expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});
    const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const mostExpensiveCategory = sortedCats[0]
        ? { category: sortedCats[0][0], amount: sortedCats[0][1] }
        : null;

    // Weekend vs weekday
    let weekendSpending = 0;
    let weekdaySpending = 0;
    expenses.forEach(e => {
        if (isWeekend(e.date)) weekendSpending += e.amount;
        else weekdaySpending += e.amount;
    });

    const total = weekendSpending + weekdaySpending;
    const weekendPct = total > 0 ? weekendSpending / total : 0;
    const weekendVsWeekday: SpendingBehavior['weekendVsWeekday'] =
        weekendPct > 0.45 ? 'weekend-heavy' : weekendPct < 0.25 ? 'weekday-heavy' : 'balanced';

    const avgTransactionSize = Math.round(total / expenses.length);

    return {
        highestSpendingDay,
        mostExpensiveCategory,
        weekendSpending,
        weekdaySpending,
        weekendVsWeekday,
        avgTransactionSize,
        totalTransactions: expenses.length,
    };
}

// ─── 5. Category Breakdown ──────────────────────────────────
export function getCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
    if (expenses.length === 0) return [];

    const byCat = expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});
    const total = Object.values(byCat).reduce((s, v) => s + v, 0);

    return Object.entries(byCat)
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
}

// ─── 6. Smart Insights (Advanced) ────────────────────────────
export function generateAdvancedInsights(
    burnRate: BurnRate,
    prediction: SpendingPrediction,
    behavior: SpendingBehavior,
    categories: CategoryBreakdown[],
    discipline: WeeklyDisciplineScore,
    remainingBalance: number,
    dailyLimit: number,
    spentToday: number,
    overspendDays: number
): SmartInsight[] {
    const insights: SmartInsight[] = [];

    // --- Daily status ---
    if (spentToday > dailyLimit && dailyLimit > 0) {
        insights.push({
            type: 'danger',
            title: 'Over Limit Today',
            text: `You spent ₹${formatCurrency(spentToday)} today vs your safe limit of ₹${formatCurrency(dailyLimit)}.`,
            icon: 'warning',
        });
    } else if (spentToday > 0) {
        insights.push({
            type: 'success',
            title: 'On Track',
            text: `You are within your daily safe limit. Keep it going!`,
            icon: 'checkmark-circle',
        });
    }

    // --- Burn rate insight ---
    if (burnRate.status === 'danger') {
        insights.push({
            type: 'danger',
            title: 'High Burn Rate',
            text: `You're spending ₹${formatCurrency(burnRate.dailyBurnRate)}/day — ${Math.round((burnRate.burnRatio - 1) * 100)}% above your safe limit.`,
            icon: 'flame',
        });
    } else if (burnRate.status === 'warning') {
        insights.push({
            type: 'warning',
            title: 'Burn Rate Rising',
            text: `Daily spend of ₹${formatCurrency(burnRate.dailyBurnRate)} is close to your safe limit.`,
            icon: 'alert-circle',
        });
    }

    // --- Prediction insight ---
    insights.push({
        type: prediction.projectedMonthlySavings > 0 ? 'info' : 'danger',
        title: 'Month-End Forecast',
        text: prediction.message,
        icon: 'analytics',
    });

    // --- Category insight ---
    if (categories.length > 0 && categories[0].percentage > 40) {
        insights.push({
            type: 'warning',
            title: 'Category Alert',
            text: `${categories[0].category} accounts for ${categories[0].percentage}% of your spending.`,
            icon: 'pie-chart',
        });
    }

    // --- Weekend insight ---
    if (behavior.weekendVsWeekday === 'weekend-heavy') {
        insights.push({
            type: 'warning',
            title: 'Weekend Spending',
            text: `Your weekend spending is higher than weekdays. Consider planning weekend activities.`,
            icon: 'calendar',
        });
    }

    // --- Overspend days ---
    if (overspendDays > 0) {
        insights.push({
            type: 'warning',
            title: 'Overspend Days',
            text: `You exceeded your daily limit ${overspendDays} times this month.`,
            icon: 'alert-circle',
        });
    } else if (dailyLimit > 0) {
        insights.push({
            type: 'success',
            title: 'Perfect Record',
            text: `You haven't exceeded your daily limit this month!`,
            icon: 'trophy',
        });
    }

    // --- Highest day insight ---
    if (behavior.highestSpendingDay && behavior.highestSpendingDay.amount > dailyLimit * 1.5) {
        insights.push({
            type: 'info',
            title: 'Peak Spending Day',
            text: `Your highest spending day was ${behavior.highestSpendingDay.day} at ₹${formatCurrency(behavior.highestSpendingDay.amount)}.`,
            icon: 'bar-chart',
        });
    }

    // --- Balance warning ---
    if (remainingBalance < 0) {
        insights.push({
            type: 'danger',
            title: 'Budget Exceeded',
            text: `You have exhausted your spendable balance for the month.`,
            icon: 'close-circle',
        });
    }

    return insights;
}

// ─── 7. Weekly Spending Trend (last 7 days) ─────────────────
export interface DailySpendEntry {
    label: string;  // short day name (Mon, Tue…)
    amount: number;
}

export function getWeeklySpendingTrend(expenses: Expense[]): DailySpendEntry[] {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: DailySpendEntry[] = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayTotal = expenses
            .filter(e => toDateKey(e.date) === key)
            .reduce((s, e) => s + e.amount, 0);
        result.push({ label: dayNames[d.getDay()], amount: dayTotal });
    }
    return result;
}

// ─── 8. Latest Expense Today ─────────────────────────────────
export function getLatestExpenseToday(expenses: Expense[]): Expense | null {
    const todayKey = new Date().toISOString().split('T')[0];
    const todayExpenses = expenses.filter(e => toDateKey(e.date) === todayKey);
    return todayExpenses.length > 0 ? todayExpenses[todayExpenses.length - 1] : null;
}

// ─── 9. Home Screen Insight (single best insight) ────────────
export function getHomeInsight(expenses: Expense[], dailyLimit: number): string {
    if (expenses.length === 0) return 'Add your first expense to get insights.';

    const behavior = analyzeSpendingBehavior(expenses);

    if (behavior.weekendVsWeekday === 'weekend-heavy') {
        return 'You tend to spend more on weekends. Plan accordingly!';
    }
    if (behavior.mostExpensiveCategory) {
        return `${behavior.mostExpensiveCategory.category} is your highest expense category this month.`;
    }
    if (behavior.avgTransactionSize > dailyLimit * 0.5 && dailyLimit > 0) {
        return `Your average transaction is ₹${formatCurrency(behavior.avgTransactionSize)} — watch the big spends.`;
    }
    return `You've made ${behavior.totalTransactions} transactions this month.`;
}

// ─── 10. Monthly Usage Color ─────────────────────────────────
export function getUsageColor(percentage: number): string {
    if (percentage <= 60) return '#6CEF8A';  // green
    if (percentage <= 85) return '#EACFA7';  // yellow/gold
    return '#EF6C6C';                        // red
}
