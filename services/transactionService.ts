import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types/money-city';

const STORAGE_KEY = '@transactions_list';

/**
 * Transaction Service
 * 
 * Handles persistence for all income and expense transactions.
 */
export const transactionService = {
    /**
     * Save a new transaction.
     */
    async storeTransaction(tx: Transaction): Promise<void> {
        try {
            const transactions = await this.getTransactions();
            const updated = [tx, ...transactions];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('[TransactionService] Failed to store transaction:', error);
            throw error;
        }
    },

    /**
     * Get all transactions.
     */
    async getTransactions(): Promise<Transaction[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[TransactionService] Failed to get transactions:', error);
            return [];
        }
    },

    /**
     * Get monthly totals for income and expenses.
     */
    async getMonthlyTotals(): Promise<{ income: number; expenses: number }> {
        const transactions = await this.getTransactions();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions.reduce(
            (acc, tx) => {
                const txDate = new Date(tx.date);
                if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                    if (tx.type === 'income') acc.income += tx.amount;
                    else acc.expenses += tx.amount;
                }
                return acc;
            },
            { income: 0, expenses: 0 }
        );
    },

    /**
     * Delete a transaction by ID.
     */
    async deleteTransaction(id: string): Promise<void> {
        try {
            const transactions = await this.getTransactions();
            const updated = transactions.filter((tx) => tx.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('[TransactionService] Failed to delete transaction:', error);
            throw error;
        }
    }
};
