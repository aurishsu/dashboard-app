import type { SiteLanguage } from './siteLanguage';

export type BillingPlanId = 'starter' | 'plus' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';

type LocalizedText = {
    zh: string;
    en: string;
};

type PlanPrice = {
    launch: number;
    regular: number;
};

export type BillingPlan = {
    id: BillingPlanId;
    name: LocalizedText;
    strapline: LocalizedText;
    summary: LocalizedText;
    badge?: LocalizedText;
    highlight?: boolean;
    trialDays?: number;
    monthly?: PlanPrice;
    yearly?: PlanPrice;
    features: LocalizedText[];
    finePrint: LocalizedText;
    cta: LocalizedText;
};

export const BILLING_PLANS: BillingPlan[] = [
    {
        id: 'starter',
        name: { zh: 'Starter', en: 'Starter' },
        strapline: {
            zh: '先把你的主账户和日常钱包接进来。',
            en: 'Bring in your core accounts and everyday wallets first.',
        },
        summary: {
            zh: '适合先试一遍桌面、结构和基础预算的人。',
            en: 'Best for trying the workspace, structure view, and core budget flow.',
        },
        badge: { zh: '免费', en: 'Free' },
        features: [
            { zh: '1 个工作区', en: '1 workspace' },
            { zh: '银行 / 钱包 / 券商基础入口', en: 'Core bank, wallet, and broker entry points' },
            { zh: '最多 3 张截图体验导入流程', en: 'Try the intake flow with up to 3 screenshots' },
            { zh: '资产总览、投资组合、预算提醒', en: 'Overview, portfolio, and budget views' },
        ],
        finePrint: {
            zh: '适合先看结构，不急着把所有资产一次放全。',
            en: 'A calmer starting point before bringing in everything at once.',
        },
        cta: { zh: '继续免费使用', en: 'Keep using Starter' },
    },
    {
        id: 'plus',
        name: { zh: 'Plus', en: 'Plus' },
        strapline: {
            zh: '把截图导入、AI Intake 和扩展资产都接进来。',
            en: 'Add screenshot intake, AI import flow, and extended asset types.',
        },
        summary: {
            zh: '最适合正在认真整理个人资产的人。',
            en: 'Built for people actively organizing their personal balance sheet.',
        },
        badge: { zh: '首发价', en: 'Launch price' },
        highlight: true,
        trialDays: 7,
        monthly: { launch: 19, regular: 29 },
        yearly: { launch: 190, regular: 290 },
        features: [
            { zh: '7 天免费试用', en: '7-day free trial' },
            { zh: '每月最多 80 张截图导入', en: 'Up to 80 screenshots each month' },
            { zh: '房产 / 车产扩展模块', en: 'Property and vehicle modules' },
            { zh: 'AI Intake 确认流和支出判断入口', en: 'AI intake confirmation and spending guidance' },
            { zh: '完整账户结构、币种分布和预算桌面', en: 'Full structure, currency, and budget workspace' },
        ],
        finePrint: {
            zh: '首发结束后恢复原价。试用结束前可随时取消，不会扣款。',
            en: 'Returns to the standard price after launch. Cancel before trial ends and you will not be charged.',
        },
        cta: { zh: '开始 7 天试用', en: 'Start 7-day trial' },
    },
    {
        id: 'pro',
        name: { zh: 'Pro', en: 'Pro' },
        strapline: {
            zh: '给更重度的用户、多工作区和更高导入频率。',
            en: 'For heavier usage, multiple workspaces, and higher import volume.',
        },
        summary: {
            zh: '适合双地生活、多人共用和更高频的资产管理。',
            en: 'Best for cross-border setups, shared households, and higher-frequency tracking.',
        },
        badge: { zh: '高阶', en: 'Advanced' },
        monthly: { launch: 39, regular: 59 },
        yearly: { launch: 390, regular: 590 },
        features: [
            { zh: '最多 3 个工作区', en: 'Up to 3 workspaces' },
            { zh: '每月最多 300 张截图导入', en: 'Up to 300 screenshots each month' },
            { zh: '家庭 / 双人资产视角', en: 'Household and shared-money views' },
            { zh: '更高优先级的 AI Intake 队列', en: 'Priority AI intake queue' },
            { zh: '更完整的资产问答和后续扩展入口', en: 'Deeper asset Q&A and advanced expansion lanes' },
        ],
        finePrint: {
            zh: '适合把 Harbor Ledger 当成持续工作台的人。',
            en: 'Made for people using Harbor Ledger as an ongoing operating surface.',
        },
        cta: { zh: '升级到 Pro', en: 'Upgrade to Pro' },
    },
];

export function localizeBilling(text: LocalizedText, language: SiteLanguage) {
    return text[language];
}

export function getBillingPlan(planId: BillingPlanId) {
    return BILLING_PLANS.find(plan => plan.id === planId) ?? BILLING_PLANS[1];
}

export function getBillingPrice(planId: BillingPlanId, cycle: BillingCycle) {
    const plan = getBillingPlan(planId);
    return cycle === 'yearly' ? plan.yearly : plan.monthly;
}

export function formatAud(value: number) {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 0,
    }).format(value);
}

const CHECKOUT_LINKS: Record<Exclude<BillingPlanId, 'starter'>, Record<BillingCycle, string | undefined>> = {
    plus: {
        monthly: import.meta.env.VITE_STRIPE_LINK_PLUS_MONTHLY,
        yearly: import.meta.env.VITE_STRIPE_LINK_PLUS_YEARLY,
    },
    pro: {
        monthly: import.meta.env.VITE_STRIPE_LINK_PRO_MONTHLY,
        yearly: import.meta.env.VITE_STRIPE_LINK_PRO_YEARLY,
    },
};

export const CUSTOMER_PORTAL_URL = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL_URL || '';

export function getCheckoutLink(planId: BillingPlanId, cycle: BillingCycle) {
    if (planId === 'starter') return '';
    return CHECKOUT_LINKS[planId][cycle] || '';
}

export function getSavingsLabel(planId: BillingPlanId, cycle: BillingCycle, language: SiteLanguage) {
    const price = getBillingPrice(planId, cycle);
    if (!price || price.regular <= price.launch) return '';
    const saved = price.regular - price.launch;
    return language === 'zh'
        ? `首发期立省 ${formatAud(saved)}`
        : `Save ${formatAud(saved)} during launch`;
}

export const BILLING_FAQS: LocalizedText[] = [
    {
        zh: '支付和订阅管理建议交给 Stripe 托管，这样界面可以保持我们自己的风格，真正收钱这一步也更稳。',
        en: 'Keep the pricing and checkout experience in your style, but let Stripe host the secure payment step.',
    },
    {
        zh: 'Plus 和 Pro 默认带 7 天试用；试用结束前取消不会扣款。',
        en: 'Plus and Pro can both start with a 7-day trial and no charge if cancelled before it ends.',
    },
    {
        zh: '首发价显示在套餐页，结束后恢复原价；上线时建议用单独的 Stripe 价格而不是手动改文案。',
        en: 'Show launch pricing on the plan page, then move to the regular price with dedicated Stripe prices instead of ad-hoc copy changes.',
    },
];
