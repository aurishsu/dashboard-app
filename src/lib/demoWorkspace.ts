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
    type SupportSourceCurrency,
} from '../types/planner';
import type { SetupAssetId, SetupInstitutionId, SetupProfileId, SetupRegionId } from './setupCatalog';

type DemoWorkspace = {
    accounts: AccountData[];
    exchangeRates: ExchangeRates;
    budgetItems: BudgetItem[];
    reminders: ReminderItem[];
    essentialPlans: EssentialPlan[];
    supportPlans: SupportPlan[];
    supportSources: SupportSource[];
};

export type DemoWorkspaceConfig = {
    profileId?: SetupProfileId | null;
    regionId?: SetupRegionId | null;
    assetIds?: SetupAssetId[];
    institutions?: SetupInstitutionId[];
};

type BudgetPreset = {
    currency: SupportSourceCurrency;
    rent: number;
    living: number;
    tuition: number;
    support: number;
};

const DEFAULT_INSTITUTION_IDS: SetupInstitutionId[] = ['cba', 'boc', 'hsbc', 'alipay', 'wechat', 'ibkr', 'moomoo'];

const REGION_BUDGET_PRESETS: Record<SetupRegionId, BudgetPreset> = {
    au: { currency: 'AUD', rent: 1600, living: 2000, tuition: 60600, support: 10000 },
    cn: { currency: 'CNY', rent: 5200, living: 3800, tuition: 58000, support: 16000 },
    sg: { currency: 'SGD', rent: 1800, living: 1300, tuition: 20500, support: 3600 },
    my: { currency: 'MYR', rent: 1700, living: 1500, tuition: 16800, support: 5600 },
    hk: { currency: 'HKD', rent: 9800, living: 6400, tuition: 92000, support: 22000 },
    us: { currency: 'USD', rent: 1700, living: 1300, tuition: 32000, support: 4500 },
};

const RAW_RATES: ExchangeRates = {
    CNY: 7.18,
    AUD: 1.52,
    SGD: 1.35,
    HKD: 7.82,
    MYR: 3.8892,
};

const ACCOUNT_TEMPLATES: Record<SetupInstitutionId, AccountData[]> = {
    cba: [
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
    ],
    anz: [
        {
            id: 'anz',
            name: 'ANZ Plus Everyday',
            type: 'bank',
            balance: 2480.52,
            currency: 'AUD',
            cardColor: 'from-sky-700 via-blue-700 to-blue-900',
            limit: '',
            number: '•••• •••• •••• 4382',
            validThru: '',
            holderName: '',
        },
    ],
    westpac: [
        {
            id: 'westpac',
            name: 'Westpac Choice',
            type: 'bank',
            balance: 1866.2,
            currency: 'AUD',
            cardColor: 'from-red-700 via-rose-700 to-red-800',
            limit: '',
            number: '•••• •••• •••• 8063',
            validThru: '',
            holderName: '',
        },
    ],
    nab: [
        {
            id: 'nab',
            name: 'NAB Everyday Account',
            type: 'bank',
            balance: 1540.88,
            currency: 'AUD',
            cardColor: 'from-red-800 via-rose-700 to-pink-800',
            limit: '',
            number: '•••• •••• •••• 2715',
            validThru: '',
            holderName: '',
        },
    ],
    'st-george': [
        {
            id: 'st-george',
            name: 'St.George Complete Freedom',
            type: 'bank',
            balance: 920.45,
            currency: 'AUD',
            cardColor: 'from-red-700 via-red-600 to-orange-700',
            limit: '',
            number: '•••• •••• •••• 1448',
            validThru: '',
            holderName: '',
        },
    ],
    macquarie: [
        {
            id: 'macquarie',
            name: 'Macquarie Transaction',
            type: 'bank',
            balance: 6150.1,
            currency: 'AUD',
            cardColor: 'from-teal-700 via-cyan-800 to-slate-900',
            limit: '',
            number: '•••• •••• •••• 3479',
            validThru: '',
            holderName: '',
        },
    ],
    ing: [
        {
            id: 'ing',
            name: 'ING Orange Everyday',
            type: 'bank',
            balance: 3380.25,
            currency: 'AUD',
            cardColor: 'from-orange-500 via-amber-500 to-orange-600',
            limit: '',
            number: '•••• •••• •••• 5812',
            validThru: '',
            holderName: '',
        },
    ],
    ubank: [
        {
            id: 'ubank',
            name: 'ubank Spend',
            type: 'bank',
            balance: 2890.22,
            currency: 'AUD',
            cardColor: 'from-orange-500 via-orange-600 to-red-600',
            limit: '',
            number: '•••• •••• •••• 9916',
            validThru: '',
            holderName: '',
        },
    ],
    bankwest: [
        {
            id: 'bankwest',
            name: 'Bankwest Easy Transaction',
            type: 'bank',
            balance: 1435.67,
            currency: 'AUD',
            cardColor: 'from-yellow-400 via-amber-400 to-amber-500',
            limit: '',
            number: '•••• •••• •••• 2664',
            validThru: '',
            holderName: '',
        },
    ],
    hsbc: [
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
    ],
    boc: [
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
    ],
    alipay: [
        {
            id: 'alipay',
            name: '支付宝钱包',
            type: 'wallet',
            balance: 12974.29,
            currency: 'CNY',
            bg: 'bg-sky-600',
        },
    ],
    wechat: [
        {
            id: 'wechat',
            name: '微信零钱通',
            type: 'wallet',
            balance: 7056.38,
            currency: 'CNY',
            bg: 'bg-emerald-500',
        },
    ],
    ibkr: [
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
    ],
    moomoo: [
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
    ],
};

const INSTITUTION_GROUPS: Record<SetupInstitutionId, SetupAssetId> = {
    cba: 'bank',
    anz: 'bank',
    westpac: 'bank',
    nab: 'bank',
    'st-george': 'bank',
    macquarie: 'bank',
    ing: 'bank',
    ubank: 'bank',
    bankwest: 'bank',
    hsbc: 'bank',
    boc: 'bank',
    alipay: 'wallet',
    wechat: 'wallet',
    ibkr: 'broker',
    moomoo: 'broker',
};

const REGION_DEFAULT_IDS: Record<SetupRegionId, SetupInstitutionId[]> = {
    au: ['cba', 'anz', 'westpac', 'hsbc', 'ibkr', 'moomoo'],
    cn: ['boc', 'alipay', 'wechat', 'hsbc', 'ibkr'],
    sg: ['hsbc', 'moomoo', 'ibkr', 'wechat'],
    my: ['hsbc', 'wechat', 'moomoo'],
    hk: ['hsbc', 'boc', 'moomoo', 'ibkr', 'wechat'],
    us: ['hsbc', 'ibkr', 'moomoo', 'ing'],
};

const PROFILE_SUPPORT_MULTIPLIER: Record<Exclude<SetupProfileId, 'family' | 'global'>, number> = {
    student: 1,
    working: 1.18,
    founder: 1.34,
};

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function getProfileMultiplier(profileId?: SetupProfileId | null) {
    if (profileId === 'working' || profileId === 'founder' || profileId === 'student') {
        return PROFILE_SUPPORT_MULTIPLIER[profileId];
    }
    return 1;
}

function getRegionPreset(regionId?: SetupRegionId | null) {
    return REGION_BUDGET_PRESETS[regionId ?? 'au'] ?? REGION_BUDGET_PRESETS.au;
}

function getInstitutionIds(config?: DemoWorkspaceConfig) {
    if (!config) return DEFAULT_INSTITUTION_IDS;

    const allowedAssetIds = new Set((config.assetIds?.length ? config.assetIds : ['bank', 'wallet', 'broker']) as SetupAssetId[]);
    const candidateIds = config.institutions?.length
        ? config.institutions
        : (config.regionId ? REGION_DEFAULT_IDS[config.regionId] : DEFAULT_INSTITUTION_IDS);

    const filtered = candidateIds.filter(id => allowedAssetIds.has(INSTITUTION_GROUPS[id]));
    return filtered.length > 0 ? filtered : DEFAULT_INSTITUTION_IDS;
}

function createAccounts(config?: DemoWorkspaceConfig) {
    const institutionIds = getInstitutionIds(config);
    return institutionIds.flatMap(id => clone(ACCOUNT_TEMPLATES[id]));
}

function createEssentialPlans(config?: DemoWorkspaceConfig) {
    const preset = getRegionPreset(config?.regionId);
    const profileMultiplier = getProfileMultiplier(config?.profileId);
    const tuitionEnabled = config?.profileId === 'student' || !config?.profileId;

    return normalizeEssentialPlans([
        {
            key: 'rent',
            enabled: true,
            label: '房租',
            currency: preset.currency,
            amount: Math.round(preset.rent * profileMultiplier),
            frequency: 'monthly',
            dueDay: 1,
            note: '',
        },
        {
            key: 'living',
            enabled: true,
            label: '生活费',
            currency: preset.currency,
            amount: Math.round(preset.living * profileMultiplier),
            frequency: 'monthly',
            dueDay: 1,
            note: '',
        },
        {
            key: 'tuition',
            enabled: tuitionEnabled,
            label: '学费',
            currency: preset.currency,
            amount: tuitionEnabled ? preset.tuition : 0,
            frequency: 'yearly',
            dueMonth: 2,
            dueDay: 15,
            note: '',
        },
    ]);
}

function createSupportSources(config?: DemoWorkspaceConfig) {
    const preset = getRegionPreset(config?.regionId);
    const profileId = config?.profileId;
    const multiplier = profileId === 'founder' ? 1.4 : profileId === 'working' ? 1.18 : 1;
    const label = profileId === 'working'
        ? '工资转入'
        : profileId === 'founder'
            ? '经营收入'
            : '固定转入';

    return normalizeSupportSources([
        {
            id: 'support_family',
            label,
            amount: Math.round(preset.support * multiplier),
            currency: preset.currency,
            dueDay: 1,
        },
    ]);
}

export function createDemoWorkspace(config?: DemoWorkspaceConfig): DemoWorkspace {
    return {
        accounts: normalizeAccounts(createAccounts(config)),
        exchangeRates: normalizeExchangeRates(clone(RAW_RATES)),
        budgetItems: normalizeBudgetItems([]),
        reminders: normalizeReminders([]),
        essentialPlans: createEssentialPlans(config),
        supportPlans: normalizeSupportPlans([]),
        supportSources: createSupportSources(config),
    };
}
