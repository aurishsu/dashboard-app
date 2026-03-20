import { normalizeAccounts, normalizeExchangeRates, type AccountData, type ExchangeRates } from '../types/data';
import {
    normalizeBudgetItems,
    normalizeEssentialPlans,
    normalizeReminders,
    normalizeSupportPlans,
    normalizeSupportSources,
    type BudgetItem,
    type EssentialPlan,
    type ReminderItem,
    type SupportPlan,
    type SupportSource,
} from '../types/planner';

type DemoWorkspace = {
    accounts: AccountData[];
    exchangeRates: ExchangeRates;
    budgetItems: BudgetItem[];
    reminders: ReminderItem[];
    essentialPlans: EssentialPlan[];
    supportPlans: SupportPlan[];
    supportSources: SupportSource[];
};

const RAW_ACCOUNTS: AccountData[] = [
    {
        id: 'cba',
        name: 'Commonwealth Bank Smart Access',
        type: 'bank',
        balance: 1160.14,
        currency: 'AUD',
        cardColor: 'from-amber-500 via-yellow-500 to-amber-600',
        limit: '',
        number: '•••• •••• •••• 9920',
        validThru: '',
        holderName: '',
    },
    {
        id: 'boc1',
        name: '中国银行 长城电子借记卡 1074',
        type: 'bank',
        balance: 26997.85,
        currency: 'CNY',
        bankGroupKey: 'boc',
        bankGroupLabel: '中国银行',
        cardColor: 'from-red-800 to-rose-900',
        limit: '',
        number: '•••• •••• •••• 1074',
        validThru: '',
        holderName: '',
    },
    {
        id: 'boc2',
        name: '中国银行 长城电子借记卡 7484',
        type: 'bank',
        balance: 0,
        currency: 'CNY',
        bankGroupKey: 'boc',
        bankGroupLabel: '中国银行',
        cardColor: 'from-red-800 to-rose-900',
        limit: '',
        number: '•••• •••• •••• 7484',
        validThru: '',
        holderName: '',
    },
    {
        id: 'hsbc',
        name: 'HSBC Premier',
        type: 'bank',
        balance: 2000,
        currency: 'USD',
        cardColor: 'from-red-700 via-red-600 to-rose-700',
        limit: '',
        number: '•••• •••• •••• 5678',
        validThru: '',
        holderName: '',
        subBalances: [
            { currency: 'CNY', balance: 0 },
            { currency: 'HKD', balance: 0 },
            { currency: 'AUD', balance: 0 },
            { currency: 'MYR', balance: 30474.95 },
        ],
    },
    {
        id: 'alipay',
        name: '支付宝钱包',
        type: 'wallet',
        balance: 12974.29,
        currency: 'CNY',
        bg: 'bg-sky-600',
    },
    {
        id: 'wechat',
        name: '微信零钱通',
        type: 'wallet',
        balance: 7056.38,
        currency: 'CNY',
        bg: 'bg-emerald-500',
    },
    {
        id: 'ibkr',
        name: 'Interactive Brokers (Pro)',
        type: 'broker',
        balance: 1000,
        currency: 'USD',
        dailyChange: 0,
        dailyChangePct: 0,
        buyingPower: 0,
    },
    {
        id: 'moomoo',
        name: 'Moomoo Financial SG',
        type: 'broker',
        balance: 10000,
        currency: 'USD',
        dailyChange: 0,
        dailyChangePct: 0,
        buyingPower: 0,
        subBalances: [{ currency: 'AUD', balance: 0 }],
    },
];

const RAW_RATES: ExchangeRates = {
    CNY: 7.18,
    AUD: 1.52,
    SGD: 1.35,
    HKD: 7.82,
    MYR: 3.8892,
};

const RAW_ESSENTIALS = [
    {
        key: 'rent',
        enabled: true,
        label: '房租',
        currency: 'AUD',
        amount: 1600,
        frequency: 'monthly',
        dueDay: 1,
        note: '',
    },
    {
        key: 'living',
        enabled: true,
        label: '生活费',
        currency: 'AUD',
        amount: 2000,
        frequency: 'monthly',
        dueDay: 1,
        note: '',
    },
    {
        key: 'tuition',
        enabled: true,
        label: '学费',
        currency: 'AUD',
        amount: 60600,
        frequency: 'yearly',
        dueMonth: 2,
        dueDay: 15,
        note: '',
    },
];

const RAW_SUPPORT_PLANS = [
    {
        key: 'family',
        enabled: false,
        label: '家里每月转入',
        currency: 'CNY',
        amount: 0,
        dueDay: 1,
        coversRent: false,
        coversLiving: true,
        note: '',
    },
];

const RAW_SUPPORT_SOURCES = [
    {
        id: 'support_family',
        label: '固定转入',
        amount: 10000,
        currency: 'AUD',
        dueDay: 1,
    },
];

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

export function createDemoWorkspace(): DemoWorkspace {
    return {
        accounts: normalizeAccounts(clone(RAW_ACCOUNTS)),
        exchangeRates: normalizeExchangeRates(clone(RAW_RATES)),
        budgetItems: normalizeBudgetItems([]),
        reminders: normalizeReminders([]),
        essentialPlans: normalizeEssentialPlans(clone(RAW_ESSENTIALS)),
        supportPlans: normalizeSupportPlans(clone(RAW_SUPPORT_PLANS)),
        supportSources: normalizeSupportSources(clone(RAW_SUPPORT_SOURCES)),
    };
}
