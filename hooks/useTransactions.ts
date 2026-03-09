import { useCallback, useEffect, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Transaction } from '@/types/money-city';
import { useExpenseDetection } from './useExpenseDetection';

/**
 * useTransactions Hook
 * 
 * Centralized hook for managing income and expense transactions.
 * Integrates with FinanceContext and useExpenseDetection for SMS.
 */
export function useTransactions() {
    const {
        transactions,
        addTransaction: addFinanceTransaction,
        deleteTransaction
    } = useFinance();

    const {
        simulateSms,
        triggerScan,
        isScanning
    } = useExpenseDetection();

    /**
     * Add a new transaction (manual or from SMS)
     */
    const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
        await addFinanceTransaction(tx);
    }, [addFinanceTransaction]);

    return {
        transactions,
        addTransaction,
        deleteTransaction,
        simulateSms,
        triggerScan,
        isScanning,
    };
}
