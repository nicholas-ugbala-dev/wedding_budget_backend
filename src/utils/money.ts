const RATE_PRECISION = 1_000_000; // store rates with 6 decimal places of precision

// Currency decimal places (number of minor units per major unit)
const CURRENCY_DECIMALS: Record<string, number> = {
    NGN: 2, USD: 2, GBP: 2, EUR: 2, GHS: 2,
    KES: 2, ZAR: 2, UGX: 2, TZS: 2, CAD: 2,
    AUD: 2, AED: 2, JPY: 0, KWD: 3,
};

function decimalsFor(currencyCode: string): number {
    return CURRENCY_DECIMALS[currencyCode.toUpperCase()] ?? 2;
}

export function toRateInt(rate: number): number {
    return Math.round(rate * RATE_PRECISION);
}

export function fromRateInt(stored: number | null): number | null {
    if (stored == null) return null;
    return stored / RATE_PRECISION;
}

export function toAmountInt(majorAmount: number, currencyCode: string): number {
    return Math.round(majorAmount * Math.pow(10, decimalsFor(currencyCode)));
}

export function fromAmountInt(minorAmount: number, currencyCode: string): number {
    return minorAmount / Math.pow(10, decimalsFor(currencyCode));
}
