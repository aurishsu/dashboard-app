import type { AccountData, AccountType, Currency } from '../types/data';

export interface AccountRow {
    account: AccountData;
    usdValue: number;
    share: number;
    currencyCount: number;
}

export interface BreakdownRow {
    key: string;
    label: string;
    usdValue: number;
    share: number;
    count: number;
}

const TYPE_LABELS: Record<AccountType, string> = {
    bank: '银行卡',
    wallet: '电子钱包',
    broker: '券商',
};

export function getAccountUsdValue(account: AccountData, toUSD: (balance: number, currency: Currency) => number) {
    return toUSD(account.balance, account.currency) +
        (account.subBalances?.reduce((sum, subBalance) => sum + toUSD(subBalance.balance, subBalance.currency), 0) || 0);
}

export function buildAccountRows(accounts: AccountData[], toUSD: (balance: number, currency: Currency) => number): AccountRow[] {
    const totalUSD = accounts.reduce((sum, account) => sum + getAccountUsdValue(account, toUSD), 0);

    return accounts
        .map(account => {
            const usdValue = getAccountUsdValue(account, toUSD);
            return {
                account,
                usdValue,
                share: totalUSD > 0 ? (usdValue / totalUSD) * 100 : 0,
                currencyCount: 1 + (account.subBalances?.length || 0),
            };
        })
        .sort((left, right) => right.usdValue - left.usdValue);
}

export function buildTypeBreakdown(accounts: AccountData[], toUSD: (balance: number, currency: Currency) => number): BreakdownRow[] {
    const totals = new Map<AccountType, { usdValue: number; count: number }>();

    for (const account of accounts) {
        const current = totals.get(account.type) ?? { usdValue: 0, count: 0 };
        current.usdValue += getAccountUsdValue(account, toUSD);
        current.count += 1;
        totals.set(account.type, current);
    }

    const grandTotal = Array.from(totals.values()).reduce((sum, row) => sum + row.usdValue, 0);

    return Array.from(totals.entries())
        .map(([type, value]) => ({
            key: type,
            label: TYPE_LABELS[type],
            usdValue: value.usdValue,
            count: value.count,
            share: grandTotal > 0 ? (value.usdValue / grandTotal) * 100 : 0,
        }))
        .sort((left, right) => right.usdValue - left.usdValue);
}

export function buildCurrencyBreakdown(accounts: AccountData[], toUSD: (balance: number, currency: Currency) => number): BreakdownRow[] {
    const totals = new Map<Currency, { usdValue: number; count: number }>();

    for (const account of accounts) {
        const primary = totals.get(account.currency) ?? { usdValue: 0, count: 0 };
        primary.usdValue += toUSD(account.balance, account.currency);
        primary.count += 1;
        totals.set(account.currency, primary);

        for (const subBalance of account.subBalances ?? []) {
            const secondary = totals.get(subBalance.currency) ?? { usdValue: 0, count: 0 };
            secondary.usdValue += toUSD(subBalance.balance, subBalance.currency);
            secondary.count += 1;
            totals.set(subBalance.currency, secondary);
        }
    }

    const grandTotal = Array.from(totals.values()).reduce((sum, row) => sum + row.usdValue, 0);

    return Array.from(totals.entries())
        .map(([currency, value]) => ({
            key: currency,
            label: currency,
            usdValue: value.usdValue,
            count: value.count,
            share: grandTotal > 0 ? (value.usdValue / grandTotal) * 100 : 0,
        }))
        .sort((left, right) => right.usdValue - left.usdValue);
}

export function getDistinctCurrencies(accounts: AccountData[]): Currency[] {
    const currencies = new Set<Currency>();

    for (const account of accounts) {
        currencies.add(account.currency);
        for (const subBalance of account.subBalances ?? []) {
            currencies.add(subBalance.currency);
        }
    }

    return Array.from(currencies.values());
}

export function getZeroValueAccounts(accounts: AccountData[], toUSD: (balance: number, currency: Currency) => number) {
    return buildAccountRows(accounts, toUSD).filter(row => row.usdValue === 0);
}
