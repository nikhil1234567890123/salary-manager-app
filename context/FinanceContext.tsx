import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAndTriggerOverspendingAlert } from '@/services/notificationService';

// ─── Types ────────────────────────────────────────────────────
export interface SalaryConfig {
    monthlySalary: number;
    fixedExpenses: number;
    savingsRate: number;
    savingsTarget?: number;
    salaryCreditDate?: number;
}

export interface Expense {
    id: string;
    amount: number;
    category: string;
    note: string;
    date: string;
}

export interface DashboardData {
    monthlySalary: number;
    fixedExpenses: number;
    savings: number;
    totalExpenses: number;
    remainingBalance: number;
    dailySafeSpend: number;
    remainingDays: number;
    spendableMoney: number;
    spentToday: number;
    predictedSavings: number;
}

interface FinanceContextType {
    salary: SalaryConfig | null;
    expenses: Expense[];
    dashboardData: DashboardData | null;
    setSalaryConfig: (config: SalaryConfig) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
    resetMonth: () => Promise<void>;
    isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
    SALARY: '@salary_config',
    EXPENSES: '@expenses_list',
    // Legacy key used by salary-setup.tsx
    STIPEND_SETUP: 'stipend_setup',
};

// ─── Calculation helpers ──────────────────────────────────────
function getRemainingDays(creditDate?: number): number {
    const now = new Date();
    if (!creditDate || creditDate < 1 || creditDate > 31) {
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return Math.max(lastDay - now.getDate(), 1);
    }

    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // If today is before the credit date in the current month
    if (currentDay < creditDate) {
        return creditDate - currentDay;
    }

    // If today is on or after the credit date, calculate days until credit date next month
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    // Handle months with fewer days than credit date
    const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const targetDate = Math.min(creditDate, daysInNextMonth);

    const nextCreditDate = new Date(nextYear, nextMonth, targetDate);
    // Use UTC to avoid daylight saving time issues affecting day count
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const utcNext = Date.UTC(nextCreditDate.getFullYear(), nextCreditDate.getMonth(), nextCreditDate.getDate());

    const diffTime = Math.abs(utcNext - utcNow);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 1);
}

function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

function computeDashboard(salary: SalaryConfig, expenses: Expense[]): DashboardData {
    const savings = salary.savingsTarget !== undefined ? salary.savingsTarget : Math.round(salary.monthlySalary * salary.savingsRate);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const spendableMoney = salary.monthlySalary - salary.fixedExpenses - savings;
    const remainingBalance = spendableMoney - totalExpenses;
    const remainingDays = getRemainingDays(salary.salaryCreditDate);
    const dailySafeSpend = remainingDays > 0 ? Math.round(Math.max(remainingBalance, 0) / remainingDays) : 0;

    // Calculate today's spending
    const todayStr = getTodayStr();
    const spentToday = expenses
        .filter(e => e.date === todayStr)
        .reduce((s, e) => s + e.amount, 0);

    // Predicted savings = savings target + whatever is left of spendable
    const predictedSavings = savings + Math.max(remainingBalance, 0);

    return {
        monthlySalary: salary.monthlySalary,
        fixedExpenses: salary.fixedExpenses,
        savings,
        totalExpenses,
        remainingBalance,
        dailySafeSpend,
        remainingDays,
        spendableMoney,
        spentToday,
        predictedSavings,
    };
}

// ─── Provider ─────────────────────────────────────────────────
export function FinanceProvider({ children }: { children: ReactNode }) {
    const [salary, setSalary] = useState<SalaryConfig | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted data on mount — bridges both storage keys
    useEffect(() => {
        (async () => {
            try {
                const [salaryStr, expensesStr, stipendStr] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.SALARY),
                    AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
                    AsyncStorage.getItem(STORAGE_KEYS.STIPEND_SETUP),
                ]);

                let loadedSalary: SalaryConfig | null = salaryStr ? JSON.parse(salaryStr) : null;
                const loadedExpenses: Expense[] = expensesStr ? JSON.parse(expensesStr) : [];

                // Bridge: if no @salary_config but stipend_setup exists, migrate it
                if (!loadedSalary && stipendStr) {
                    const stipend = JSON.parse(stipendStr);
                    loadedSalary = {
                        monthlySalary: stipend.totalSalary || 0,
                        fixedExpenses: stipend.fixedExpenses || 0,
                        savingsRate: stipend.totalSalary > 0
                            ? (stipend.predictedSavings || stipend.totalSalary * 0.2) / stipend.totalSalary
                            : 0.2,
                    };
                    // Persist in the canonical key
                    await AsyncStorage.setItem(STORAGE_KEYS.SALARY, JSON.stringify(loadedSalary));
                }

                setSalary(loadedSalary);
                setExpenses(loadedExpenses);

                if (loadedSalary) {
                    setDashboardData(computeDashboard(loadedSalary, loadedExpenses));
                }
            } catch (e) {
                console.error('Failed to load finance data', e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const setSalaryConfig = useCallback(async (config: SalaryConfig) => {
        setSalary(config);
        await AsyncStorage.setItem(STORAGE_KEYS.SALARY, JSON.stringify(config));

        // Also write to stipend_setup so the existing salary-setup screen stays in sync
        const savingsNum = config.savingsTarget !== undefined ? config.savingsTarget : Math.round(config.monthlySalary * config.savingsRate);
        const balance = config.monthlySalary - config.fixedExpenses - savingsNum;
        const daysLeft = getRemainingDays(config.salaryCreditDate);
        const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
        const todayStr = getTodayStr();
        const spentToday = expenses.filter(e => e.date === todayStr).reduce((s, e) => s + e.amount, 0);

        await AsyncStorage.setItem(STORAGE_KEYS.STIPEND_SETUP, JSON.stringify({
            totalSalary: config.monthlySalary,
            fixedExpenses: config.fixedExpenses,
            predictedSavings: savingsNum,
            dailySafeSpend: daysLeft > 0 ? Math.floor(Math.max(balance - totalExp, 0) / daysLeft) : 0,
            remainingBalance: balance - totalExp,
            spentThisMonth: totalExp,
            spentToday,
        }));

        setDashboardData(computeDashboard(config, expenses));
    }, [expenses]);

    const addExpenseItem = useCallback(async (expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            ...expense,
        };
        const updated = [...expenses, newExpense];
        setExpenses(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

        if (salary) {
            const newDashboard = computeDashboard(salary, updated);
            setDashboardData(newDashboard);

            await AsyncStorage.setItem(STORAGE_KEYS.STIPEND_SETUP, JSON.stringify({
                totalSalary: salary.monthlySalary,
                fixedExpenses: salary.fixedExpenses,
                predictedSavings: newDashboard.predictedSavings,
                dailySafeSpend: newDashboard.dailySafeSpend,
                remainingBalance: newDashboard.remainingBalance,
                spentThisMonth: newDashboard.totalExpenses,
                spentToday: newDashboard.spentToday,
            }));

            // Trigger notification
            await checkAndTriggerOverspendingAlert(newDashboard.spentToday, newDashboard.dailySafeSpend);
        }
    }, [expenses, salary]);

    const refreshData = useCallback(async () => {
        // Re-read from storage in case salary-setup.tsx wrote directly
        try {
            const stipendStr = await AsyncStorage.getItem(STORAGE_KEYS.STIPEND_SETUP);
            const salaryStr = await AsyncStorage.getItem(STORAGE_KEYS.SALARY);
            const expensesStr = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);

            // Read raw current salary from storage instead of depending on context state
            let currentSalary: SalaryConfig | null = salaryStr ? JSON.parse(salaryStr) : null;

            // If stipend_setup was written more recently (e.g. from salary-setup screen)
            if (stipendStr) {
                const stipend = JSON.parse(stipendStr);
                const fromStipend: SalaryConfig = {
                    monthlySalary: stipend.totalSalary || 0,
                    fixedExpenses: stipend.fixedExpenses || 0,
                    savingsRate: stipend.totalSalary > 0
                        ? (stipend.predictedSavings || stipend.totalSalary * 0.2) / stipend.totalSalary
                        : 0.2,
                };

                // Use stipend_setup data if it differs from current context
                if (!currentSalary || fromStipend.monthlySalary !== currentSalary.monthlySalary ||
                    fromStipend.fixedExpenses !== currentSalary.fixedExpenses) {
                    currentSalary = fromStipend;
                    setSalary(currentSalary);
                    await AsyncStorage.setItem(STORAGE_KEYS.SALARY, JSON.stringify(currentSalary));
                }
            } else if (currentSalary) {
                setSalary(currentSalary);
            }

            const loadedExpenses: Expense[] = expensesStr ? JSON.parse(expensesStr) : [];
            setExpenses(loadedExpenses);

            if (currentSalary) {
                setDashboardData(computeDashboard(currentSalary, loadedExpenses));
            }
        } catch (e) {
            console.error('Failed to refresh data', e);
        }
    }, []); // Empty dependencies makes this function stable

    const resetMonth = useCallback(async () => {
        setExpenses([]);
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
        if (salary) {
            const newDashboard = computeDashboard(salary, []);
            setDashboardData(newDashboard);
            await AsyncStorage.setItem(STORAGE_KEYS.STIPEND_SETUP, JSON.stringify({
                totalSalary: salary.monthlySalary,
                fixedExpenses: salary.fixedExpenses,
                predictedSavings: newDashboard.predictedSavings,
                dailySafeSpend: newDashboard.dailySafeSpend,
                remainingBalance: newDashboard.remainingBalance,
                spentThisMonth: 0,
                spentToday: 0,
            }));
        }
    }, [salary]);

    const deleteExpense = useCallback(async (id: string) => {
        const updated = expenses.filter(e => e.id !== id);
        setExpenses(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
        if (salary) {
            const newDashboard = computeDashboard(salary, updated);
            setDashboardData(newDashboard);
            await AsyncStorage.setItem(STORAGE_KEYS.STIPEND_SETUP, JSON.stringify({
                totalSalary: salary.monthlySalary,
                fixedExpenses: salary.fixedExpenses,
                predictedSavings: newDashboard.predictedSavings,
                dailySafeSpend: newDashboard.dailySafeSpend,
                remainingBalance: newDashboard.remainingBalance,
                spentThisMonth: newDashboard.totalExpenses,
                spentToday: newDashboard.spentToday,
            }));
        }
    }, [expenses, salary]);

    return (
        <FinanceContext.Provider
            value={{
                salary,
                expenses,
                dashboardData,
                setSalaryConfig,
                addExpense: addExpenseItem,
                deleteExpense,
                refreshData,
                resetMonth,
                isLoading,
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance(): FinanceContextType {
    const ctx = useContext(FinanceContext);
    if (!ctx) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return ctx;
}
