export type Currency = 'USD' | 'CNY' | 'AUD' | 'SGD' | 'HKD' | 'MYR';
export type AccountType = 'bank' | 'wallet' | 'broker';

export interface SubBalance {
    currency: Currency;
    balance: number;
}

export interface AccountData {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: Currency;
    bankGroupKey?: string;
    bankGroupLabel?: string;
    // Bank card fields
    limit?: string;
    number?: string;
    cardColor?: string;
    validThru?: string;
    holderName?: string;
    // Multi-currency support
    subBalances?: SubBalance[];
    // Broker fields
    dailyChange?: number;
    dailyChangePct?: number;
    buyingPower?: number;
    // Wallet fields
    bg?: string;
}

export interface ExchangeRates {
    CNY: number;
    AUD: number;
    SGD: number;
    HKD: number;
    MYR: number;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    USD: '$', CNY: '¥', AUD: 'A$', SGD: 'S$', HKD: 'HK$', MYR: 'RM',
};

export const BANK_CARD_THEMES = [
    { label: 'CBA 金黄', value: 'from-amber-500 via-yellow-500 to-amber-600' },
    { label: 'HSBC 红', value: 'from-red-700 via-red-600 to-rose-700' },
    { label: '中银红', value: 'from-red-800 to-rose-900' },
    { label: '石墨', value: 'from-slate-700 to-slate-950' },
    { label: '深海', value: 'from-slate-800 to-blue-950' },
    { label: '烟灰', value: 'from-neutral-700 to-slate-900' },
] as const;

export const WALLET_THEMES = [
    { label: '支付宝蓝', value: 'bg-sky-600' },
    { label: '微信绿', value: 'bg-emerald-500' },
    { label: '曜黑', value: 'bg-slate-950' },
    { label: '深灰', value: 'bg-slate-800' },
    { label: '钢灰', value: 'bg-slate-700' },
    { label: '炭灰', value: 'bg-neutral-800' },
] as const;

export const DEFAULT_RATES: ExchangeRates = { CNY: 7.18, AUD: 1.52, SGD: 1.35, HKD: 7.82, MYR: 3.8892 };

export const INITIAL_ACCOUNTS: AccountData[] = [
    {
        id: 'cba', name: 'Commonwealth Bank Smart Access', type: 'bank', balance: 0, currency: 'AUD',
        cardColor: 'from-amber-500 via-yellow-500 to-amber-600', limit: '', number: '•••• •••• •••• 9920',
        validThru: '', holderName: '',
    },
    {
        id: 'boc1', name: '中国银行 长城电子借记卡 1074', type: 'bank', balance: 0, currency: 'CNY',
        bankGroupKey: 'boc', bankGroupLabel: '中国银行',
        cardColor: 'from-red-800 to-rose-900', limit: '', number: '•••• •••• •••• 1074',
        validThru: '', holderName: '',
    },
    {
        id: 'boc2', name: '中国银行 长城电子借记卡 7484', type: 'bank', balance: 0, currency: 'CNY',
        bankGroupKey: 'boc', bankGroupLabel: '中国银行',
        cardColor: 'from-red-800 to-rose-900', limit: '', number: '•••• •••• •••• 7484',
        validThru: '', holderName: '',
    },
    {
        id: 'hsbc', name: 'HSBC Premier', type: 'bank', balance: 0, currency: 'USD',
        cardColor: 'from-red-700 via-red-600 to-rose-700', limit: '', number: '•••• •••• •••• 5678',
        validThru: '', holderName: '',
        subBalances: [
            { currency: 'CNY', balance: 0 },
            { currency: 'HKD', balance: 0 },
            { currency: 'AUD', balance: 0 },
            { currency: 'MYR', balance: 0 },
        ],
    },
    { id: 'alipay', name: '支付宝钱包', type: 'wallet', balance: 0, currency: 'CNY', bg: 'bg-sky-600' },
    { id: 'wechat', name: '微信零钱通', type: 'wallet', balance: 0, currency: 'CNY', bg: 'bg-emerald-500' },
    {
        id: 'ibkr', name: 'Interactive Brokers (Pro)', type: 'broker', balance: 0, currency: 'USD',
        dailyChange: 0, dailyChangePct: 0, buyingPower: 0,
    },
    {
        id: 'moomoo', name: 'Moomoo Financial SG', type: 'broker', balance: 0, currency: 'USD',
        dailyChange: 0, dailyChangePct: 0, buyingPower: 0,
        subBalances: [
            { currency: 'AUD', balance: 0 },
        ],
    },
];

export function createStarterAccounts(): AccountData[] {
    return normalizeAccounts(
        INITIAL_ACCOUNTS.map(account => ({
            ...account,
            balance: 0,
            subBalances: account.subBalances?.map(subBalance => ({
                ...subBalance,
                balance: 0,
            })),
            buyingPower: typeof account.buyingPower === 'number' ? 0 : account.buyingPower,
            dailyChange: typeof account.dailyChange === 'number' ? 0 : account.dailyChange,
            dailyChangePct: typeof account.dailyChangePct === 'number' ? 0 : account.dailyChangePct,
        })),
    );
}

function findAccountTemplate(id: string) {
    return INITIAL_ACCOUNTS.find(account => account.id === id);
}

const LEGACY_CARD_THEME_MAP: Record<string, string> = {
    'from-amber-400 to-orange-400': 'from-amber-500 via-yellow-500 to-amber-600',
    'from-red-600 to-red-800': 'from-red-800 to-rose-900',
    'from-red-700 to-rose-900': 'from-red-800 to-rose-900',
    'from-blue-700 to-blue-950': 'from-slate-800 to-blue-950',
    'from-emerald-500 to-teal-700': 'from-slate-700 to-slate-900',
    'from-purple-600 to-indigo-800': 'from-neutral-700 to-slate-900',
    'from-blue-500 to-sky-400': 'from-slate-600 to-slate-900',
    'from-orange-500 to-red-500': 'from-stone-700 to-neutral-950',
};

const LEGACY_WALLET_THEME_MAP: Record<string, string> = {
    'bg-blue-600': 'bg-sky-600',
    'bg-emerald-500': 'bg-emerald-500',
    'bg-orange-500': 'bg-stone-700',
    'bg-purple-600': 'bg-zinc-800',
    'bg-red-500': 'bg-neutral-800',
};

const BANK_THEME_BY_ACCOUNT: Record<string, string> = {
    cba: 'from-amber-500 via-yellow-500 to-amber-600',
    hsbc: 'from-red-700 via-red-600 to-rose-700',
    boc1: 'from-red-800 to-rose-900',
    boc2: 'from-red-800 to-rose-900',
};

const WALLET_THEME_BY_ACCOUNT: Record<string, string> = {
    alipay: 'bg-sky-600',
    wechat: 'bg-emerald-500',
};

const BANK_GROUP_BY_ACCOUNT: Record<string, { key: string; label: string }> = {
    boc1: { key: 'boc', label: '中国银行' },
    boc2: { key: 'boc', label: '中国银行' },
};

export function normalizeCardTheme(value?: string) {
    if (!value) return BANK_CARD_THEMES[0].value;
    return LEGACY_CARD_THEME_MAP[value] ?? value;
}

export function normalizeWalletTheme(value?: string) {
    if (!value) return WALLET_THEMES[0].value;
    return LEGACY_WALLET_THEME_MAP[value] ?? value;
}

function withProfessionalTheme(account: AccountData): AccountData {
    if (account.type === 'bank') {
        return {
            ...account,
            cardColor: BANK_THEME_BY_ACCOUNT[account.id] ?? normalizeCardTheme(account.cardColor),
            bankGroupKey: account.bankGroupKey ?? BANK_GROUP_BY_ACCOUNT[account.id]?.key,
            bankGroupLabel: account.bankGroupLabel ?? BANK_GROUP_BY_ACCOUNT[account.id]?.label,
        };
    }

    if (account.type === 'wallet') {
        return {
            ...account,
            bg: WALLET_THEME_BY_ACCOUNT[account.id] ?? normalizeWalletTheme(account.bg),
        };
    }

    return account;
}

export function normalizeAccounts(accounts: AccountData[]): AccountData[] {
    return accounts.map(account => {
        if (account.id === 'hsbc') {
            const cnyBalance = account.subBalances?.find(subBalance => subBalance.currency === 'CNY')?.balance ?? 0;
            const hkdBalance = account.subBalances?.find(subBalance => subBalance.currency === 'HKD')?.balance ?? 0;
            const audBalance = account.subBalances?.find(subBalance => subBalance.currency === 'AUD')?.balance ?? 0;
            const myrBalance =
                account.subBalances?.find(subBalance => subBalance.currency === 'MYR')?.balance ??
                account.subBalances?.find(subBalance => subBalance.currency === 'SGD')?.balance ??
                0;

            return withProfessionalTheme({
                ...account,
                subBalances: [
                    { currency: 'CNY', balance: cnyBalance },
                    { currency: 'HKD', balance: hkdBalance },
                    { currency: 'AUD', balance: audBalance },
                    { currency: 'MYR', balance: myrBalance },
                ],
            });
        }

        if (account.id === 'ibkr') {
            return withProfessionalTheme({
                ...account,
                currency: 'USD',
                subBalances: undefined,
            });
        }

        if (account.id === 'moomoo') {
            const template = findAccountTemplate('moomoo');
            const existingAudBalance = account.subBalances?.find(subBalance => subBalance.currency === 'AUD')?.balance;
            const looksLikeLegacySeed =
                account.currency === 'SGD' &&
                account.balance === 42500 &&
                (!account.subBalances || account.subBalances.length === 0);

            return withProfessionalTheme({
                ...(template ?? account),
                ...account,
                currency: 'USD',
                balance: looksLikeLegacySeed ? (template?.balance ?? account.balance) : account.balance,
                subBalances: [
                    {
                        currency: 'AUD',
                        balance: looksLikeLegacySeed ? (template?.subBalances?.[0]?.balance ?? 0) : (existingAudBalance ?? 0),
                    },
                ],
            });
        }

        return withProfessionalTheme(account);
    });
}

export function normalizeExchangeRates(rates: Partial<ExchangeRates> | null | undefined): ExchangeRates {
    return {
        ...DEFAULT_RATES,
        ...(rates ?? {}),
    };
}
