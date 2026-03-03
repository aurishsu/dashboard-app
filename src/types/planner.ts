import type { Currency } from './data';

export type BudgetEntryType = 'expense' | 'income' | 'transfer';
export type ReminderFrequency = 'once' | 'monthly' | 'yearly';
export type EssentialPlanKey = 'rent' | 'living' | 'tuition';
export type EssentialPlanFrequency = 'monthly' | 'yearly';
export type SupportPlanKey = 'family';
export type SupportSourceCurrency = 'AUD' | 'CNY' | 'USD' | 'MYR' | 'SGD' | 'HKD';

export interface BudgetItem {
    id: string;
    name: string;
    type: BudgetEntryType;
    currency: Currency;
    planned: number;
    actual: number;
    note?: string;
}

export interface ReminderItem {
    id: string;
    title: string;
    dueDate: string;
    frequency: ReminderFrequency;
    amount?: number;
    currency?: Currency;
    accountId?: string;
    note?: string;
    doneAt?: string;
}

export interface EssentialPlan {
    key: EssentialPlanKey;
    enabled: boolean;
    label: string;
    currency: Currency;
    amount: number;
    fundingAccountId?: string;
    frequency: EssentialPlanFrequency;
    dueDay: number;
    dueMonth?: number;
    note?: string;
}

export interface SupportPlan {
    key: SupportPlanKey;
    enabled: boolean;
    label: string;
    currency: Currency;
    amount: number;
    dueDay: number;
    destinationAccountId?: string;
    coversRent: boolean;
    coversLiving: boolean;
    note?: string;
}

export interface SupportSource {
    id: string;
    label: string;
    amount: number;
    currency: SupportSourceCurrency;
    dueDay: number;
    accountId?: string;
}

const VALID_BUDGET_TYPES = new Set<BudgetEntryType>(['expense', 'income', 'transfer']);
const VALID_FREQUENCIES = new Set<ReminderFrequency>(['once', 'monthly', 'yearly']);
const VALID_CURRENCIES = new Set<Currency>(['USD', 'CNY', 'AUD', 'SGD', 'HKD', 'MYR']);
const VALID_ESSENTIAL_KEYS = new Set<EssentialPlanKey>(['rent', 'living', 'tuition']);
const VALID_SUPPORT_KEYS = new Set<SupportPlanKey>(['family']);
const VALID_SUPPORT_SOURCE_CURRENCIES = new Set<SupportSourceCurrency>(['AUD', 'CNY', 'USD', 'MYR', 'SGD', 'HKD']);

export const DEFAULT_ESSENTIAL_PLANS: EssentialPlan[] = [
    {
        key: 'rent',
        enabled: true,
        label: '房租',
        currency: 'AUD',
        amount: 0,
        fundingAccountId: undefined,
        frequency: 'monthly',
        dueDay: 1,
        note: '',
    },
    {
        key: 'living',
        enabled: true,
        label: '生活费',
        currency: 'AUD',
        amount: 0,
        fundingAccountId: undefined,
        frequency: 'monthly',
        dueDay: 1,
        note: '',
    },
    {
        key: 'tuition',
        enabled: false,
        label: '学费',
        currency: 'AUD',
        amount: 0,
        fundingAccountId: undefined,
        frequency: 'yearly',
        dueMonth: 2,
        dueDay: 15,
        note: '',
    },
] as const;

export const DEFAULT_SUPPORT_PLANS: SupportPlan[] = [
    {
        key: 'family',
        enabled: false,
        label: '家里每月转入',
        currency: 'CNY',
        amount: 0,
        dueDay: 1,
        destinationAccountId: undefined,
        coversRent: false,
        coversLiving: true,
        note: '',
    },
] as const;

export const DEFAULT_SUPPORT_SOURCES: SupportSource[] = [
    {
        id: 'support_family',
        label: '固定转入',
        amount: 0,
        currency: 'AUD',
        dueDay: 1,
        accountId: undefined,
    },
] as const;

export const STARTER_ESSENTIAL_PLANS: EssentialPlan[] = DEFAULT_ESSENTIAL_PLANS.map(plan => ({
    ...plan,
    amount: 0,
    note: '',
}));

export const STARTER_SUPPORT_SOURCES: SupportSource[] = DEFAULT_SUPPORT_SOURCES.map(source => ({
    ...source,
    amount: 0,
}));

export function normalizeBudgetItems(input: unknown): BudgetItem[] {
    if (!Array.isArray(input)) return [];

    return input.reduce<BudgetItem[]>((items, item) => {
        if (!item || typeof item !== 'object') return items;

        const candidate = item as Partial<BudgetItem>;
        if (!candidate.id || typeof candidate.id !== 'string') return items;
        if (!candidate.name || typeof candidate.name !== 'string') return items;

        const type = VALID_BUDGET_TYPES.has(candidate.type as BudgetEntryType) ? candidate.type as BudgetEntryType : 'expense';
        const currency = VALID_CURRENCIES.has(candidate.currency as Currency) ? candidate.currency as Currency : 'AUD';
        const planned = Number.isFinite(Number(candidate.planned)) ? Number(candidate.planned) : 0;
        const actual = Number.isFinite(Number(candidate.actual)) ? Number(candidate.actual) : 0;

        items.push({
            id: candidate.id,
            name: candidate.name.trim(),
            type,
            currency,
            planned,
            actual,
            note: typeof candidate.note === 'string' ? candidate.note : '',
        });

        return items;
    }, []);
}

export function normalizeReminders(input: unknown): ReminderItem[] {
    if (!Array.isArray(input)) return [];

    return input.reduce<ReminderItem[]>((items, item) => {
        if (!item || typeof item !== 'object') return items;

        const candidate = item as Partial<ReminderItem>;
        if (!candidate.id || typeof candidate.id !== 'string') return items;
        if (!candidate.title || typeof candidate.title !== 'string') return items;
        if (!candidate.dueDate || typeof candidate.dueDate !== 'string') return items;

        const frequency = VALID_FREQUENCIES.has(candidate.frequency as ReminderFrequency)
            ? candidate.frequency as ReminderFrequency
            : 'once';
        const currency = VALID_CURRENCIES.has(candidate.currency as Currency) ? candidate.currency as Currency : undefined;
        const amount = Number.isFinite(Number(candidate.amount)) ? Number(candidate.amount) : undefined;

        items.push({
            id: candidate.id,
            title: candidate.title.trim(),
            dueDate: candidate.dueDate,
            frequency,
            amount,
            currency,
            accountId: typeof candidate.accountId === 'string' ? candidate.accountId : undefined,
            note: typeof candidate.note === 'string' ? candidate.note : '',
            doneAt: typeof candidate.doneAt === 'string' ? candidate.doneAt : undefined,
        });

        return items;
    }, []);
}

export function normalizeEssentialPlans(input: unknown): EssentialPlan[] {
    const incoming = Array.isArray(input) ? input : [];
    const normalized = incoming.reduce<EssentialPlan[]>((plans, item) => {
        if (!item || typeof item !== 'object') return plans;

        const candidate = item as Partial<EssentialPlan>;
        if (!VALID_ESSENTIAL_KEYS.has(candidate.key as EssentialPlanKey)) return plans;

        const template = DEFAULT_ESSENTIAL_PLANS.find(plan => plan.key === candidate.key);
        if (!template) return plans;

        plans.push({
            ...template,
            ...candidate,
            currency: VALID_CURRENCIES.has(candidate.currency as Currency) ? candidate.currency as Currency : template.currency,
            amount: Number.isFinite(Number(candidate.amount)) ? Number(candidate.amount) : template.amount,
            dueDay: Number.isFinite(Number(candidate.dueDay)) ? Number(candidate.dueDay) : template.dueDay,
            dueMonth: Number.isFinite(Number(candidate.dueMonth)) ? Number(candidate.dueMonth) : template.dueMonth,
            enabled: Boolean(candidate.enabled),
            note: typeof candidate.note === 'string' ? candidate.note : '',
            fundingAccountId: typeof candidate.fundingAccountId === 'string' ? candidate.fundingAccountId : undefined,
        });

        return plans;
    }, []);

    return DEFAULT_ESSENTIAL_PLANS.map(template => normalized.find(item => item.key === template.key) ?? template);
}

export function normalizeSupportPlans(input: unknown): SupportPlan[] {
    const incoming = Array.isArray(input) ? input : [];
    const normalized = incoming.reduce<SupportPlan[]>((plans, item) => {
        if (!item || typeof item !== 'object') return plans;

        const candidate = item as Partial<SupportPlan>;
        if (!VALID_SUPPORT_KEYS.has(candidate.key as SupportPlanKey)) return plans;

        const template = DEFAULT_SUPPORT_PLANS.find(plan => plan.key === candidate.key);
        if (!template) return plans;

        plans.push({
            ...template,
            ...candidate,
            currency: VALID_CURRENCIES.has(candidate.currency as Currency) ? candidate.currency as Currency : template.currency,
            amount: Number.isFinite(Number(candidate.amount)) ? Number(candidate.amount) : template.amount,
            dueDay: Number.isFinite(Number(candidate.dueDay)) ? Number(candidate.dueDay) : template.dueDay,
            enabled: Boolean(candidate.enabled),
            destinationAccountId: typeof candidate.destinationAccountId === 'string' ? candidate.destinationAccountId : undefined,
            coversRent: typeof candidate.coversRent === 'boolean' ? candidate.coversRent : template.coversRent,
            coversLiving: typeof candidate.coversLiving === 'boolean' ? candidate.coversLiving : template.coversLiving,
            note: typeof candidate.note === 'string' ? candidate.note : '',
        });

        return plans;
    }, []);

    return DEFAULT_SUPPORT_PLANS.map(template => normalized.find(item => item.key === template.key) ?? template);
}

export function normalizeSupportSources(input: unknown): SupportSource[] {
    if (!Array.isArray(input)) return [...DEFAULT_SUPPORT_SOURCES];

    const normalized = input.reduce<SupportSource[]>((sources, item) => {
        if (!item || typeof item !== 'object') return sources;

        const candidate = item as Partial<SupportSource>;
        if (!candidate.id || typeof candidate.id !== 'string') return sources;

        sources.push({
            id: candidate.id,
            label: typeof candidate.label === 'string' && candidate.label.trim() ? candidate.label.trim() : '固定转入',
            amount: Number.isFinite(Number(candidate.amount)) ? Number(candidate.amount) : 0,
            currency: VALID_SUPPORT_SOURCE_CURRENCIES.has(candidate.currency as SupportSourceCurrency)
                ? candidate.currency as SupportSourceCurrency
                : 'CNY',
            dueDay: Number.isFinite(Number(candidate.dueDay)) ? Number(candidate.dueDay) : 1,
            accountId: typeof candidate.accountId === 'string' ? candidate.accountId : undefined,
        });

        return sources;
    }, []);

    return normalized.length > 0 ? normalized : [...DEFAULT_SUPPORT_SOURCES];
}
