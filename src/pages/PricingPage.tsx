import { Check, Landmark, MoonStar, Sparkles, SunMedium } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '../context/useTheme';
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';
import {
    BILLING_FAQS,
    BILLING_PLANS,
    CUSTOMER_PORTAL_URL,
    formatAud,
    getBillingPrice,
    getSavingsLabel,
    localizeBilling,
    type BillingCycle,
    type BillingPlan,
} from '../lib/billingCatalog';

type PricingCopy = {
    title: string;
    body: string;
    monthly: string;
    yearly: string;
    yearlyTag: string;
    launch: string;
    regular: string;
    manage: string;
    openProduct: string;
    backSetup: string;
    faqTitle: string;
};

const COPY: Record<SiteLanguage, PricingCopy> = {
    zh: {
        title: '选择适合你的套餐',
        body: '先把核心体验免费给到，再把更重度的 AI Intake、扩展资产和高频导入放进付费层级里。',
        monthly: '按月付',
        yearly: '按年付',
        yearlyTag: '更省',
        launch: '首发价',
        regular: '恢复原价',
        manage: '管理订阅',
        openProduct: '回到产品',
        backSetup: '继续设置',
        faqTitle: '付款和订阅说明',
    },
    en: {
        title: 'Choose the plan that fits your workflow',
        body: 'Keep the core experience free, then move screenshot intake, extended assets, and higher-volume usage into paid tiers.',
        monthly: 'Monthly',
        yearly: 'Yearly',
        yearlyTag: 'Save more',
        launch: 'Launch price',
        regular: 'Regular price',
        manage: 'Manage billing',
        openProduct: 'Back to product',
        backSetup: 'Continue setup',
        faqTitle: 'Billing and payment notes',
    },
};

export function PricingPage() {
    const { isDark, toggleTheme } = useTheme();
    const [language, setLanguage] = useState<SiteLanguage>(() => loadSiteLanguage());
    const [cycle, setCycle] = useState<BillingCycle>('monthly');
    const copy = COPY[language];

    useEffect(() => {
        saveSiteLanguage(language);
    }, [language]);

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col px-5 py-6 sm:px-7 lg:px-10">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                        <div className="flex size-10 items-center justify-center rounded-full bg-white text-slate-950">
                            <Landmark size={18} />
                        </div>
                        <div>
                            <p className="text-[1.02rem] font-semibold tracking-[-0.03em]">Harbor Ledger</p>
                            <p className="text-xs text-white/55">Pricing</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                            <button
                                type="button"
                                onClick={() => setLanguage('zh')}
                                className={`rounded-full px-3 py-2 text-xs font-medium transition ${language === 'zh' ? 'bg-white text-slate-950' : 'text-white/62 hover:text-white'}`}
                            >
                                中文
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={`rounded-full px-3 py-2 text-xs font-medium transition ${language === 'en' ? 'bg-white text-slate-950' : 'text-white/62 hover:text-white'}`}
                            >
                                EN
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/76 transition hover:text-white"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
                        </button>

                        {CUSTOMER_PORTAL_URL ? (
                            <a
                                href={CUSTOMER_PORTAL_URL}
                                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/82 transition hover:text-white"
                            >
                                {copy.manage}
                            </a>
                        ) : null}

                        <Link
                            to="/dashboard"
                            className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                        >
                            {copy.openProduct}
                        </Link>
                    </div>
                </header>

                <main className="flex-1 pt-10">
                    <div className="mx-auto max-w-[1180px] text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#4a3b2a] bg-[#251a12] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#f3d4a4]">
                            <Sparkles size={14} />
                            {copy.launch}
                        </div>
                        <h1 className="mt-6 text-[clamp(2.6rem,4.6vw,4.4rem)] font-semibold tracking-[-0.05em] text-white">
                            {copy.title}
                        </h1>
                        <p className="mx-auto mt-4 max-w-[760px] text-base leading-8 text-white/58">
                            {copy.body}
                        </p>

                        <div className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/6 p-1">
                            <CycleToggle active={cycle === 'monthly'} onClick={() => setCycle('monthly')}>
                                {copy.monthly}
                            </CycleToggle>
                            <CycleToggle active={cycle === 'yearly'} onClick={() => setCycle('yearly')}>
                                <span>{copy.yearly}</span>
                                <span className="rounded-full bg-[#2c2015] px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[#f3d4a4]">
                                    {copy.yearlyTag}
                                </span>
                            </CycleToggle>
                        </div>
                    </div>

                    <div className="mx-auto mt-10 grid max-w-[1320px] gap-6 xl:grid-cols-3">
                        {BILLING_PLANS.map(plan => (
                            <PlanCard key={plan.id} plan={plan} cycle={cycle} language={language} copy={copy} />
                        ))}
                    </div>

                    <section className="mx-auto mt-10 grid max-w-[1320px] gap-4 lg:grid-cols-3">
                        {BILLING_FAQS.map(item => (
                            <div
                                key={item.zh}
                                className="rounded-[30px] border border-white/10 bg-white/4 px-6 py-5 text-left"
                            >
                                <p className="text-sm leading-7 text-white/62">{localizeBilling(item, language)}</p>
                            </div>
                        ))}
                    </section>

                    <div className="mx-auto mt-10 flex max-w-[1320px] justify-center">
                        <Link
                            to="/setup"
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/82 transition hover:text-white"
                        >
                            {copy.backSetup}
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}

function formatPlanNumber(value: number) {
    return new Intl.NumberFormat('en-AU', {
        maximumFractionDigits: 0,
    }).format(value);
}

function PlanCard({
    plan,
    cycle,
    language,
    copy,
}: {
    plan: BillingPlan;
    cycle: BillingCycle;
    language: SiteLanguage;
    copy: PricingCopy;
}) {
    const price = getBillingPrice(plan.id, cycle);
    const savingsLabel = getSavingsLabel(plan.id, cycle, language);

    return (
        <section
            className={`rounded-[34px] border p-6 text-left ${
                plan.highlight
                    ? 'border-[#5b4532] bg-[linear-gradient(180deg,#231914_0%,#181818_100%)] shadow-[0_28px_80px_rgba(0,0,0,0.28)]'
                    : 'border-white/10 bg-white/4'
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[2rem] font-semibold tracking-[-0.04em] text-white">{localizeBilling(plan.name, language)}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">{localizeBilling(plan.summary, language)}</p>
                </div>
                {plan.badge ? (
                    <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.14em] ${
                            plan.highlight ? 'bg-[#2c2015] text-[#f3d4a4]' : 'bg-white/8 text-white/62'
                        }`}
                    >
                        {localizeBilling(plan.badge, language)}
                    </span>
                ) : null}
            </div>

            <div className="mt-8 min-h-[112px]">
                {price ? (
                    <>
                        <div className="flex items-end gap-3">
                            <span className="text-lg text-white/52">A$</span>
                            <p className="text-[4rem] font-semibold leading-none tracking-[-0.07em] text-white">{formatPlanNumber(price.launch)}</p>
                            <p className="pb-2 text-sm text-white/55">AUD / {cycle === 'monthly' ? (language === 'zh' ? '月' : 'month') : (language === 'zh' ? '年' : 'year')}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                            <span className="rounded-full bg-[#2c2015] px-3 py-1 text-[#f3d4a4]">
                                {copy.launch}
                            </span>
                            <span className="rounded-full bg-white/8 px-3 py-1 text-white/72">
                                {copy.regular} {formatAud(price.regular)}
                            </span>
                            {savingsLabel ? <span className="text-[#f3d4a4]">{savingsLabel}</span> : null}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-end gap-3">
                            <span className="text-lg text-white/52">A$</span>
                            <p className="text-[4rem] font-semibold leading-none tracking-[-0.07em] text-white">0</p>
                            <p className="pb-2 text-sm text-white/55">AUD / {language === 'zh' ? '月' : 'month'}</p>
                        </div>
                        <div className="mt-2 text-sm text-white/52">{localizeBilling(plan.strapline, language)}</div>
                    </>
                )}
            </div>

            <div className="mt-6">
                <Link
                    to={plan.id === 'starter' ? '/setup' : `/checkout?plan=${plan.id}&cycle=${cycle}`}
                    className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                        plan.highlight
                            ? 'bg-white text-slate-950 hover:-translate-y-0.5'
                            : 'border border-white/12 bg-white/5 text-white hover:bg-white/8'
                    }`}
                >
                    {localizeBilling(plan.cta, language)}
                </Link>
            </div>

            <div className="mt-7 space-y-3">
                {plan.features.map(feature => (
                    <div key={feature.zh} className="flex items-start gap-3 text-sm text-white/72">
                        <Check size={15} className="mt-0.5 shrink-0 text-white" />
                        <span>{localizeBilling(feature, language)}</span>
                    </div>
                ))}
            </div>

            {plan.trialDays ? (
                <div className="mt-6 rounded-[22px] border border-[#5b4532] bg-[#21170f] px-4 py-4 text-sm text-[#f3d4a4]">
                    {language === 'zh'
                        ? `${plan.trialDays} 天免费试用，试用结束前取消不会扣款。`
                        : `${plan.trialDays}-day free trial. Cancel before it ends and you will not be charged.`}
                </div>
            ) : null}

            <p className="mt-6 text-sm leading-7 text-white/48">{localizeBilling(plan.finePrint, language)}</p>
        </section>
    );
}

function CycleToggle({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? 'bg-white text-slate-950' : 'text-white/64 hover:text-white'
            }`}
        >
            {children}
        </button>
    );
}
