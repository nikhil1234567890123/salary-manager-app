/**
 * Models for the automatic expense detection system.
 * Used by SMS parser (Android) and smart suggestions (iOS).
 */

/** Source of the detected transaction */
export type TransactionSource = 'sms' | 'suggestion';

/** A transaction detected from SMS parsing */
export interface DetectedTransaction {
    /** Unique hash ID for deduplication (derived from amount + merchant + timestamp) */
    id: string;
    /** Transaction amount in INR */
    amount: number;
    /** Merchant or payee name extracted from SMS ("Unknown Transaction" if undetected) */
    merchant: string;
    /** Whether the merchant could not be identified from SMS */
    isUnknown: boolean;
    /** Auto-suggested category based on merchant mapping */
    category: string;
    /** Transaction type – currently only 'debit' is detected */
    type: 'debit';
    /** ISO date string (YYYY-MM-DD) */
    date: string;
    /** Original SMS timestamp in ms since epoch */
    timestamp: number;
    /** Where the transaction was detected from */
    source: TransactionSource;
    /** Raw SMS body snippet (first 80 chars) for user context – NOT stored long-term */
    snippet?: string;
    /** SMS sender address (e.g. "AD-HDFCBK") — used by merchant learning system */
    smsAddress?: string;
}

/** A smart suggestion generated from user behavior patterns (iOS / fallback) */
export interface SmartSuggestion {
    /** Unique suggestion ID */
    id: string;
    /** Suggested amount */
    amount: number;
    /** Suggested merchant name */
    merchant: string;
    /** Auto-suggested category */
    category: string;
    /** Human-readable prompt, e.g. "Did you spend ₹320 on Swiggy today?" */
    displayMessage: string;
    /** Confidence score 0-1 (higher = more likely) */
    confidence: number;
    /** ISO date string */
    date: string;
}

/** Raw SMS message structure (Android) */
export interface RawSmsMessage {
    /** SMS body text */
    body: string;
    /** Sender address / phone number */
    address: string;
    /** Timestamp in ms since epoch */
    timestamp: number;
}
