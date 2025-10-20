import { StoreSettings } from './types';

export const formatCurrency = (amount: number, settings: StoreSettings): string => {
    try {
        const formatter = new Intl.NumberFormat(navigator.language || 'en-US', {
            style: 'currency',
            currency: settings.currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        const parts = formatter.formatToParts(amount);
        
        // Find the currency part and replace its value with the custom symbol from settings
        const currencyPart = parts.find(part => part.type === 'currency');
        if (currencyPart) {
            currencyPart.value = settings.currency.symbol;
        }

        // Reconstruct the string from the modified parts
        return parts.map(part => part.value).join('');

    } catch (e) {
        // Fallback for unsupported currency codes or other errors
        console.warn(`Currency formatting failed for code: ${settings.currency.code}. Using fallback.`);
        // A simple fallback that at least formats the number with commas
         const numberFormatter = new Intl.NumberFormat(navigator.language || 'en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        const formattedNumber = numberFormatter.format(amount);
        // This simple prepend might not be correct for all locales, but it's a reasonable fallback.
        return `${settings.currency.symbol}${formattedNumber}`;
    }
};
