/**
 * Formatting utilities for currency and numbers.
 */

/** Format number in Indian currency style: 245000 → "₹2,45,000" */
export function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

/** Abbreviate large numbers: 245000 → "₹245k" */
export function formatCurrencyShort(amount) {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
    return `₹${amount}`;
}

/** Calculate percentage, rounded */
export function percentage(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
}
