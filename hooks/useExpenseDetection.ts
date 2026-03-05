/**
 * useExpenseDetection Hook
 *
 * Main consumer hook that combines Android SMS detection
 * and cross-platform smart suggestions.
 *
 * Includes merchant learning: when a user edits an unknown transaction's
 * merchant/category before confirming, the correction is stored for
 * future automatic detection.
 *
 * Usage in any screen:
 *   const {
 *     detectedTransactions,
 *     suggestions,
 *     confirmTransaction,
 *     editAndConfirmTransaction,
 *     dismissTransaction,
 *     acceptSuggestion,
 *     dismissSuggestion,
 *     updateTransactionField,
 *     isScanning,
 *   } = useExpenseDetection();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { DetectedTransaction, SmartSuggestion } from '@/models/detectedTransaction';
import {
    scanForNewTransactions,
    confirmDetectedTransaction,
    dismissDetectedTransaction,
} from '@/services/expenseDetectionService';
import { generateSuggestions } from '@/services/smartSuggestionService';
import { learnMerchant } from '@/services/merchantLearningService';
import { useFinance } from '@/context/FinanceContext';

/** How often to scan for new SMS (ms) — 5 minutes */
const SCAN_INTERVAL_MS = 5 * 60 * 1000;

export interface UseExpenseDetectionReturn {
    /** Transactions detected from SMS (Android only) */
    detectedTransactions: DetectedTransaction[];
    /** Smart suggestions based on behavior (all platforms) */
    suggestions: SmartSuggestion[];
    /** Confirm a detected SMS transaction as-is and add it as an expense */
    confirmTransaction: (tx: DetectedTransaction) => Promise<void>;
    /**
     * Edit merchant/category on a detected transaction, then confirm.
     * Triggers merchant learning so future similar SMS auto-resolve.
     */
    editAndConfirmTransaction: (
        tx: DetectedTransaction,
        editedMerchant: string,
        editedCategory: string
    ) => Promise<void>;
    /** Dismiss a detected SMS transaction (won't show again) */
    dismissTransaction: (tx: DetectedTransaction) => Promise<void>;
    /** Accept a smart suggestion and add it as an expense */
    acceptSuggestion: (suggestion: SmartSuggestion) => Promise<void>;
    /** Dismiss a smart suggestion */
    dismissSuggestion: (suggestionId: string) => void;
    /**
     * Update a field on a pending transaction in-place (before confirming).
     * Allows the user to edit merchant/category in the UI before saving.
     */
    updateTransactionField: (
        txId: string,
        field: 'merchant' | 'category',
        value: string
    ) => void;
    /** Whether the SMS scanner is currently running */
    isScanning: boolean;
    /** Manually trigger a scan */
    triggerScan: () => Promise<void>;
}

export function useExpenseDetection(): UseExpenseDetectionReturn {
    const { addExpense, expenses } = useFinance();

    const [detectedTransactions, setDetectedTransactions] = useState<DetectedTransaction[]>([]);
    const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ─── Android SMS Scanning ─────────────────────────────────────

    const runScan = useCallback(async () => {
        if (Platform.OS !== 'android') return;

        setIsScanning(true);
        try {
            const newTransactions = await scanForNewTransactions();
            if (newTransactions.length > 0) {
                setDetectedTransactions((prev) => {
                    // Merge new transactions, avoiding duplicates by ID
                    const existingIds = new Set(prev.map((t) => t.id));
                    const unique = newTransactions.filter((t) => !existingIds.has(t.id));
                    return [...unique, ...prev];
                });
            }
        } catch (error) {
            console.warn('[ExpenseDetection] Scan failed:', error);
        } finally {
            setIsScanning(false);
        }
    }, []);

    // Start periodic scanning on Android
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        // Initial scan
        runScan();

        // Periodic scan
        intervalRef.current = setInterval(runScan, SCAN_INTERVAL_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [runScan]);

    // Re-scan when app comes to foreground (Android)
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const handleAppState = (state: AppStateStatus) => {
            if (state === 'active') {
                runScan();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppState);
        return () => subscription.remove();
    }, [runScan]);

    // ─── Smart Suggestions (All Platforms) ────────────────────────

    useEffect(() => {
        // Generate suggestions from expense history
        const newSuggestions = generateSuggestions(expenses);
        setSuggestions(newSuggestions);
    }, [expenses]);

    // ─── In-Place Editing ─────────────────────────────────────────

    const updateTransactionField = useCallback(
        (txId: string, field: 'merchant' | 'category', value: string) => {
            setDetectedTransactions((prev) =>
                prev.map((tx) => {
                    if (tx.id !== txId) return tx;
                    return {
                        ...tx,
                        [field]: value,
                        // Once merchant is edited, clear the unknown flag
                        isUnknown: field === 'merchant' ? false : tx.isUnknown,
                    };
                })
            );
        },
        []
    );

    // ─── Actions ──────────────────────────────────────────────────

    const confirmTransaction = useCallback(
        async (tx: DetectedTransaction) => {
            // Add as expense via FinanceContext
            await addExpense({
                amount: tx.amount,
                category: tx.category,
                note: tx.merchant,
                date: tx.date,
            });

            // Mark as processed
            await confirmDetectedTransaction(tx);

            // Remove from pending list
            setDetectedTransactions((prev) => prev.filter((t) => t.id !== tx.id));
        },
        [addExpense]
    );

    const editAndConfirmTransaction = useCallback(
        async (
            tx: DetectedTransaction,
            editedMerchant: string,
            editedCategory: string
        ) => {
            // Learn the merchant mapping for future auto-detection
            if (tx.smsAddress && editedMerchant !== 'Unknown Transaction') {
                await learnMerchant(
                    tx.smsAddress,
                    tx.amount,
                    editedMerchant,
                    editedCategory
                );
            }

            // Add as expense with the user-corrected values
            await addExpense({
                amount: tx.amount,
                category: editedCategory,
                note: editedMerchant,
                date: tx.date,
            });

            // Mark as processed
            await confirmDetectedTransaction(tx);

            // Remove from pending list
            setDetectedTransactions((prev) => prev.filter((t) => t.id !== tx.id));
        },
        [addExpense]
    );

    const dismissTransaction = useCallback(async (tx: DetectedTransaction) => {
        // Mark as processed (won't show again)
        await dismissDetectedTransaction(tx);

        // Remove from pending list
        setDetectedTransactions((prev) => prev.filter((t) => t.id !== tx.id));
    }, []);

    const acceptSuggestion = useCallback(
        async (suggestion: SmartSuggestion) => {
            // Add as expense via FinanceContext
            await addExpense({
                amount: suggestion.amount,
                category: suggestion.category,
                note: suggestion.merchant,
                date: suggestion.date,
            });

            // Remove from suggestions list
            setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
        },
        [addExpense]
    );

    const dismissSuggestion = useCallback((suggestionId: string) => {
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    }, []);

    const triggerScan = useCallback(async () => {
        await runScan();
    }, [runScan]);

    return {
        detectedTransactions,
        suggestions,
        confirmTransaction,
        editAndConfirmTransaction,
        dismissTransaction,
        acceptSuggestion,
        dismissSuggestion,
        updateTransactionField,
        isScanning,
        triggerScan,
    };
}
