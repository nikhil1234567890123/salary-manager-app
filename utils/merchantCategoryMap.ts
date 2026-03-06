/**
 * Merchant → Category intelligence system.
 *
 * Categories match the existing ExpenseForm categories:
 *   Food, Transport, Shopping, Bills, Health, Entertainment, Education, Other
 */

interface MerchantEntry {
    /** Lowercase keyword to match against merchant name */
    keyword: string;
    /** Category from the app's category list */
    category: string;
}

/**
 * Merchant detection database.
 * Uses case-insensitive substring matching.
 * More specific entries should appear before generic ones.
 */
const MERCHANT_DATABASE: MerchantEntry[] = [
    // ── Food & Dining ─────────────────────────────────────────────
    { keyword: 'swiggy', category: 'Food' },
    { keyword: 'zomato', category: 'Food' },
    { keyword: 'dominos', category: 'Food' },
    { keyword: "domino's", category: 'Food' },
    { keyword: 'pizza hut', category: 'Food' },
    { keyword: 'mcdonald', category: 'Food' },
    { keyword: 'burger king', category: 'Food' },
    { keyword: 'kfc', category: 'Food' },
    { keyword: 'starbucks', category: 'Food' },
    { keyword: 'cafe coffee', category: 'Food' },
    { keyword: 'dunkin', category: 'Food' },
    { keyword: 'subway', category: 'Food' },
    { keyword: 'barbeque', category: 'Food' },
    { keyword: 'biryani', category: 'Food' },
    { keyword: 'restaurant', category: 'Food' },
    { keyword: 'food', category: 'Food' },
    { keyword: 'eat', category: 'Food' },
    { keyword: 'dineout', category: 'Food' },
    { keyword: 'eazydiner', category: 'Food' },
    { keyword: 'blinkit', category: 'Food' },
    { keyword: 'zepto', category: 'Food' },
    { keyword: 'instamart', category: 'Food' },
    { keyword: 'bigbasket', category: 'Food' },
    { keyword: 'grofers', category: 'Food' },
    { keyword: 'jiomart', category: 'Food' },
    { keyword: 'grocery', category: 'Food' },
    { keyword: 'supermarket', category: 'Food' },
    { keyword: 'dmart', category: 'Food' },

    // ── Transport ─────────────────────────────────────────────────
    { keyword: 'uber', category: 'Transport' },
    { keyword: 'ola', category: 'Transport' },
    { keyword: 'rapido', category: 'Transport' },
    { keyword: 'namma yatri', category: 'Transport' },
    { keyword: 'porter', category: 'Transport' },
    { keyword: 'metro', category: 'Transport' },
    { keyword: 'irctc', category: 'Transport' },
    { keyword: 'redbus', category: 'Transport' },
    { keyword: 'makemytrip', category: 'Transport' },
    { keyword: 'cleartrip', category: 'Transport' },
    { keyword: 'goibibo', category: 'Transport' },
    { keyword: 'petrol', category: 'Transport' },
    { keyword: 'fuel', category: 'Transport' },
    { keyword: 'iocl', category: 'Transport' },
    { keyword: 'bpcl', category: 'Transport' },
    { keyword: 'hpcl', category: 'Transport' },
    { keyword: 'parking', category: 'Transport' },
    { keyword: 'fastag', category: 'Transport' },
    { keyword: 'toll', category: 'Transport' },

    // ── Shopping ──────────────────────────────────────────────────
    { keyword: 'amazon', category: 'Shopping' },
    { keyword: 'flipkart', category: 'Shopping' },
    { keyword: 'myntra', category: 'Shopping' },
    { keyword: 'ajio', category: 'Shopping' },
    { keyword: 'nykaa', category: 'Shopping' },
    { keyword: 'meesho', category: 'Shopping' },
    { keyword: 'tata cliq', category: 'Shopping' },
    { keyword: 'snapdeal', category: 'Shopping' },
    { keyword: 'croma', category: 'Shopping' },
    { keyword: 'reliance', category: 'Shopping' },
    { keyword: 'shoppers stop', category: 'Shopping' },
    { keyword: 'lifestyle', category: 'Shopping' },

    // ── Bills & Utilities ─────────────────────────────────────────
    { keyword: 'jio', category: 'Bills' },
    { keyword: 'airtel', category: 'Bills' },
    { keyword: 'vodafone', category: 'Bills' },
    { keyword: 'vi ', category: 'Bills' },
    { keyword: 'bsnl', category: 'Bills' },
    { keyword: 'electricity', category: 'Bills' },
    { keyword: 'electric', category: 'Bills' },
    { keyword: 'water bill', category: 'Bills' },
    { keyword: 'gas bill', category: 'Bills' },
    { keyword: 'broadband', category: 'Bills' },
    { keyword: 'wifi', category: 'Bills' },
    { keyword: 'rent', category: 'Bills' },
    { keyword: 'insurance', category: 'Bills' },
    { keyword: 'emi', category: 'Bills' },

    // ── Health ─────────────────────────────────────────────────────
    { keyword: 'apollo', category: 'Health' },
    { keyword: 'pharmeasy', category: 'Health' },
    { keyword: 'netmeds', category: 'Health' },
    { keyword: '1mg', category: 'Health' },
    { keyword: 'tata health', category: 'Health' },
    { keyword: 'medplus', category: 'Health' },
    { keyword: 'pharmacy', category: 'Health' },
    { keyword: 'hospital', category: 'Health' },
    { keyword: 'clinic', category: 'Health' },
    { keyword: 'doctor', category: 'Health' },
    { keyword: 'diagnostic', category: 'Health' },
    { keyword: 'lab', category: 'Health' },
    { keyword: 'gym', category: 'Health' },
    { keyword: 'cult.fit', category: 'Health' },
    { keyword: 'cultfit', category: 'Health' },

    // ── Entertainment ─────────────────────────────────────────────
    { keyword: 'netflix', category: 'Entertainment' },
    { keyword: 'hotstar', category: 'Entertainment' },
    { keyword: 'disney', category: 'Entertainment' },
    { keyword: 'spotify', category: 'Entertainment' },
    { keyword: 'prime video', category: 'Entertainment' },
    { keyword: 'amazon prime', category: 'Entertainment' },
    { keyword: 'youtube', category: 'Entertainment' },
    { keyword: 'sony liv', category: 'Entertainment' },
    { keyword: 'zee5', category: 'Entertainment' },
    { keyword: 'jiocinema', category: 'Entertainment' },
    { keyword: 'bookmyshow', category: 'Entertainment' },
    { keyword: 'pvr', category: 'Entertainment' },
    { keyword: 'inox', category: 'Entertainment' },
    { keyword: 'cinema', category: 'Entertainment' },
    { keyword: 'movie', category: 'Entertainment' },
    { keyword: 'gaming', category: 'Entertainment' },
    { keyword: 'game', category: 'Entertainment' },
    { keyword: 'apple music', category: 'Entertainment' },
    { keyword: 'gaana', category: 'Entertainment' },
    { keyword: 'wynk', category: 'Entertainment' },

    // ── Education ─────────────────────────────────────────────────
    { keyword: 'coursera', category: 'Education' },
    { keyword: 'udemy', category: 'Education' },
    { keyword: 'unacademy', category: 'Education' },
    { keyword: 'byju', category: 'Education' },
    { keyword: 'vedantu', category: 'Education' },
    { keyword: 'upgrad', category: 'Education' },
    { keyword: 'simplilearn', category: 'Education' },
    { keyword: 'school', category: 'Education' },
    { keyword: 'college', category: 'Education' },
    { keyword: 'tuition', category: 'Education' },
    { keyword: 'hostel', category: 'Education' },
    { keyword: 'warden', category: 'Education' },
    { keyword: 'university', category: 'Education' },
    { keyword: 'institute', category: 'Education' },
    { keyword: 'academy', category: 'Education' },

    // ── Bills & Subscriptions ─────────────────────────────────────
    { keyword: 'google', category: 'Bills' },
    { keyword: 'apple', category: 'Bills' },
    { keyword: 'microsoft', category: 'Bills' },
    { keyword: 'icloud', category: 'Bills' },
    { keyword: 'gpay', category: 'Bills' },
    { keyword: 'phonepe', category: 'Bills' },
    { keyword: 'paytm', category: 'Bills' },
    { keyword: 'cred', category: 'Bills' },
    { keyword: 'bajaj finance', category: 'Bills' },
    { keyword: 'bajaj finserv', category: 'Bills' },
    { keyword: 'loan', category: 'Bills' },
    { keyword: 'mutual fund', category: 'Bills' },
    { keyword: 'sip', category: 'Bills' },
    { keyword: 'groww', category: 'Bills' },
    { keyword: 'zerodha', category: 'Bills' },
    { keyword: 'upstox', category: 'Bills' },
];

/**
 * Detect the category for a given merchant name.
 * Uses case-insensitive substring matching.
 *
 * @param merchant - The merchant name extracted from SMS
 * @returns The matched category, or 'Other' if no match found
 */
export function detectCategory(merchant: string | null): string {
    if (!merchant) return 'Other';

    const lower = merchant.toLowerCase();

    for (const entry of MERCHANT_DATABASE) {
        if (lower.includes(entry.keyword)) {
            return entry.category;
        }
    }

    return 'Other';
}

/**
 * Get all known merchants for a given category.
 * Useful for building suggestion prompts.
 */
export function getMerchantsByCategory(category: string): string[] {
    return MERCHANT_DATABASE
        .filter((entry) => entry.category === category)
        .map((entry) => entry.keyword);
}

/**
 * Check if a string looks like a known merchant.
 * Returns the normalized merchant name if found, null otherwise.
 */
export function normalizedMerchantName(text: string): string | null {
    if (!text) return null;

    const lower = text.toLowerCase();

    for (const entry of MERCHANT_DATABASE) {
        if (lower.includes(entry.keyword)) {
            // Capitalize first letter of each word in the keyword
            return entry.keyword
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
        }
    }

    return null;
}

/**
 * Scan the FULL SMS body for any known merchant name.
 * This is used as a fallback when regex-based merchant extraction
 * fails to extract the merchant from patterns like "trf to XYZ".
 *
 * For example, a Netflix UPI mandate SMS might not have "trf to Netflix"
 * but the word "Netflix" appears somewhere in the message body.
 *
 * @param fullSmsBody - The entire SMS text
 * @returns { merchant: string, category: string } or null
 */
export function scanBodyForMerchant(fullSmsBody: string): { merchant: string; category: string } | null {
    if (!fullSmsBody) return null;

    const lower = fullSmsBody.toLowerCase();

    for (const entry of MERCHANT_DATABASE) {
        if (lower.includes(entry.keyword)) {
            const merchant = entry.keyword
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
            return { merchant, category: entry.category };
        }
    }

    return null;
}
