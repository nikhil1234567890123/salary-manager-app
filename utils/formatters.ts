/**
 * Formats a number with comma separators for thousands.
 * Using a manual regex to avoid inconsistencies with toLocaleString() in React Native.
 */
export const formatCurrency = (amount: number): string => {
    if (amount === undefined || amount === null) return '0';

    const rounded = Math.round(amount);
    const numStr = Math.abs(rounded).toString();

    let result = '';
    let count = 0;

    // Manual insertion from right to left
    for (let i = numStr.length - 1; i >= 0; i--) {
        if (count > 0 && count % 3 === 0) {
            result = ',' + result;
        }
        result = numStr[i] + result;
        count++;
    }

    return (rounded < 0 ? '-' : '') + result;
};

/**
 * Specifically for Indian numbering system (e.g. 1,00,000)
 */
export const formatCurrencyIN = (amount: number): string => {
    if (amount === undefined || amount === null) return '0';
    const rounded = Math.round(amount);
    const parts = rounded.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};
