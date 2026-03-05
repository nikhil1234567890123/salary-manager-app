/**
 * useSmartSuggestions Hook
 *
 * Standalone hook for iOS smart suggestion cards.
 * Analyzes expense history patterns and returns actionable suggestions.
 *
 * Usage:
 *   const { suggestions, acceptSuggestion, dismissSuggestion } = useSmartSuggestions();
 */

import { useState, useEffect, useCallback } from 'react';
import { SmartSuggestion } from '@/models/detectedTransaction';
import { generateSuggestions } from '@/services/smartSuggestionService';
import { useFinance } from '@/context/FinanceContext';

export interface UseSmartSuggestionsReturn {
    /** Smart suggestions based on behavior patterns */
    suggestions: SmartSuggestion[];
    /** Accept a suggestion and add it as an expense */
    acceptSuggestion: (suggestion: SmartSuggestion) => Promise<void>;
    /** Dismiss a suggestion (won't affect future suggestions) */
    dismissSuggestion: (suggestionId: string) => void;
    /** Whether suggestions are being generated */
    isLoading: boolean;
}

export function useSmartSuggestions(): UseSmartSuggestionsReturn {
    const { addExpense, expenses } = useFinance();

    const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Generate suggestions whenever expenses change
    useEffect(() => {
        setIsLoading(true);
        try {
            const newSuggestions = generateSuggestions(expenses);
            setSuggestions(newSuggestions);
        } catch (error) {
            console.warn('[SmartSuggestions] Failed to generate:', error);
        } finally {
            setIsLoading(false);
        }
    }, [expenses]);

    const acceptSuggestion = useCallback(
        async (suggestion: SmartSuggestion) => {
            // Add as expense via FinanceContext
            await addExpense({
                amount: suggestion.amount,
                category: suggestion.category,
                note: suggestion.merchant,
                date: suggestion.date,
            });

            // Remove from suggestions
            setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
        },
        [addExpense]
    );

    const dismissSuggestion = useCallback((suggestionId: string) => {
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    }, []);

    return {
        suggestions,
        acceptSuggestion,
        dismissSuggestion,
        isLoading,
    };
}
