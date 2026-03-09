/**
 * Centralized TypeScript interfaces for all premium financial insight features.
 * Each interface maps to a specific service module.
 */

// ─── 1. Salary Stability Score ─────────────────────────────────
export type VariationLevel = 'low' | 'medium' | 'high';

export interface StabilityScore {
    /** Overall stability score from 0–100 */
    score: number;
    /** Percentage of salary records that were delayed */
    delayFrequency: number;
    /** How much salary amounts vary month-to-month */
    variationLevel: VariationLevel;
    /** Human-readable explanation */
    explanation: string;
}

// ─── 2. "Where Did My Money Go?" Insight ───────────────────────
export interface CategorySpend {
    category: string;
    amount: number;
    percentage: number;
}

export interface ExpenseInsight {
    /** Expenses grouped by category */
    categoryBreakdown: CategorySpend[];
    /** Category with the highest total */
    highestCategory: { category: string; amount: number } | null;
    /** Most frequently appearing merchant/note */
    mostUsedMerchant: { name: string; count: number } | null;
    /** Day with the highest total spend */
    mostExpensiveDay: { date: string; amount: number } | null;
    /** AI-style readable insight summary */
    summary: string;
}

// ─── 3. Money Mood Tracker ─────────────────────────────────────
export type MoneyMoodType = 'Balanced' | 'Stress Spending' | 'Weekend Splurge' | 'Overspending';

export interface MoneyMood {
    mood: MoneyMoodType;
    explanation: string;
    /** Emoji icon representing the mood */
    emoji: string;
}

// ─── 4. Offline Privacy Mode ───────────────────────────────────
// Handled via AppSettings — no separate type needed.

// ─── 5. Financial Leak Detector ────────────────────────────────
export interface FinancialLeak {
    category: string;
    amount: number;
    /** Percentage of salary this category represents */
    percentageOfSalary: number;
    /** Warning message */
    warning: string;
    /** Actionable suggestion */
    suggestion: string;
}

// ─── 6. Salary Survival Timer ──────────────────────────────────
export interface SurvivalTimer {
    /** How many days the current balance will last */
    daysRemaining: number;
    /** Recommended daily spending to stretch balance */
    dailySafeLimit: number;
    /** Human-readable message */
    message: string;
}

// ─── 7. Future Savings Simulator ───────────────────────────────
export interface SavingsProjection {
    /** Category to reduce spending in */
    category: string;
    /** Monthly reduction amount */
    monthlyReduction: number;
    /** Projected yearly savings */
    yearlySavings: number;
    /** Human-readable projection message */
    message: string;
    /** Chart-ready data points (monthly cumulative savings) */
    chartData: { month: number; savings: number }[];
}

// ─── 8. Money Personality Analyzer ─────────────────────────────
export type PersonalityType = 'The Planner' | 'The Spender' | 'The Investor' | 'The Survivor';

export interface MoneyPersonality {
    personality: PersonalityType;
    description: string;
    /** Emoji representing the personality */
    emoji: string;
}

// ─── 9. Payday Celebration Mode ────────────────────────────────
export interface PaydayEvent {
    /** Amount credited */
    amount: number;
    /** Quick actions available */
    quickActions: PaydayAction[];
}

export interface PaydayAction {
    id: string;
    label: string;
    icon: string;
}

// ─── 10. AI Money Roast ────────────────────────────────────────
export interface MoneyRoast {
    /** The category being roasted */
    category: string;
    /** Amount spent in that category */
    amount: number;
    /** The roast message */
    roast: string;
}

// ─── Visual Dashboard Interfaces ──────────────────────────────

export interface TimelineEvent {
    id: string;
    date: string; // ISO date string
    type: 'salary' | 'high_expense' | 'warning' | 'milestone' | 'insight';
    title: string;
    description: string;
    amount?: number;
    icon: string; // Ionicons string
    color: string;
}

export interface RadarMetrics {
    stability: number;       // 0-100
    control: number;         // 0-100
    savings: number;         // 0-100
    moodScore: number;       // 0-100
    risk: number;            // 0-100 (Inverted: lower risk = higher score)
}

export interface PlanetCategory {
    category: string;
    amount: number;
    radius: number;          // Represents planet size
    color: string;
    orbitRadius: number;     // Distance from center
    speed: number;           // Orbital animation speed
}

export interface FinancialHealthScore {
    score: number;           // 0-100
    label: string;
    color: string;
    metrics: RadarMetrics;
}

export interface AIBrainSummary {
    messages: string[];
}

// ─── Composite Hook Return Type ────────────────────────────────
export interface FinancialInsights {
    stabilityScore: StabilityScore | null;
    expenseInsight: ExpenseInsight | null;
    moneyMood: MoneyMood | null;
    financialLeaks: FinancialLeak[];
    survivalTimer: SurvivalTimer | null;
    savingsProjections: SavingsProjection[];
    moneyPersonality: MoneyPersonality | null;
    moneyRoast: MoneyRoast | null;

    // Visual dashboard additions
    healthScore?: FinancialHealthScore;
    timeline?: TimelineEvent[];
    radarMetrics?: RadarMetrics;
    universe?: PlanetCategory[];
    brainSummary?: AIBrainSummary;
}

