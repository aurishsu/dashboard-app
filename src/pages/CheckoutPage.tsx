import { ArrowLeft, ArrowUpRight, Check, Landmark, LockKeyhole, MoonStar, ShieldCheck, Sparkles, SunMedium } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/useTheme';
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';
import {
    CUSTOMER_PORTAL_URL,
    formatAud,
    getBillingPlan,
    getBillingPrice,
    getCheckoutLink,
    localizeBilling,
    type BillingCycle,
    type BillingPlanId,
} from '../lib/billingCatalog';

type CheckoutCopy = {
    title: string;
    body: string;
    summary: string;
    secure: string;
    payNow: string;
    unavailable: string;
    backPricing: string;
    manage: string;
    trial: string;
    restore: string;
    whatHappens: string;
    notes: string[];
};

const COPY: Record<SiteLanguage, CheckoutCopy> = {
    zh: {
        title: '确认你的套餐',
        body: '先在这里确认套餐、首发价和试用信息，付款会跳到 Stripe 的安全结账页完成。',
        summary: '订单摘要',
        secure: '实际付款将在 Stripe 安全页面完成',
        payNow: '前往安全支付',
        unavailable: '支付链接即将开放',
        backPricing: '返回套餐页',
        manage: '管理订阅',
        trial: '7 天免费试用',
        restore: '之后恢复原价',
        whatHappens: '付款后你会得到什么',
        notes: [
            '试用结束前取消不会扣款。',
            '首发价和原价都会提前写清楚，不做暗扣。',
            '后续改套餐、取消或查看账单，建议放到 Stripe Customer Portal 里完成。',
        ],
    },
    en: {
        title: 'Confirm your plan',
        body: 'Review the plan, launch price, and trial terms here first. The payment step will finish on a secure Stripe checkout page.',
        summary: 'Order summary',
        secure: 'The final payment step is handled on Stripe Checkout',
        payNow: 'Continue to secure payment',
        unavailable: 'Checkout link coming soon',
        backPricing: 'Back to pricing',
        manage: 'Manage billing',
        trial: '7-day free trial',
        restore: 'Then returns to the regular price',
        whatHappens: 'What you get right away',
        notes: [
            'Cancel before the trial ends and you will not be charged.',
            'Launch price and regular price are shown before payment.',
            'Plan changes, cancellation, and invoices should live in Stripe Customer Portal.',
        ],
    },
};

function parsePlanId(value: string | null): BillingPlanId {
    return value === 'starter' || value === 'plus' || value === 'pro' ? value : 'plus';
}

function parseCycle(value: string | null): BillingCycle {
    return value === 'yearly' ? 'yearly' : 'monthly';
}

export function CheckoutPage() {
    const { isDark, toggleTheme } = useTheme();
    const [language, setLanguage] = useState<SiteLanguage>(() => loadSiteLanguage());
    const [searchParams] = useSearchParams();
    const planId = parsePlanId(searchParams.get('plan'));
    const cycle = parseCycle(searchParams.get('cycle'));
    const plan = getBillingPlan(planId);
    const price = getBillingPrice(planId, cycle);
    const checkoutLink = getCheckoutLink(planId, cycle);
    const copy = COPY[language];

    useEffect(() => {
        saveSiteLanguage(language);
    }, [language]);

    const cycleLabel = cycle === 'monthly'
        ? (language === 'zh' ? '每月' : 'per month')
        : (language === 'zh' ? '每年' : 'per year');

    return (
        <div className="min-h-screen bg-[#f2ecdf] text-slate-950 dark:bg-[#0e1014] dark:text-white">
            <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 py-6 sm:px-7 lg:px-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/88 px-4 py-3 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-[#15171b]/86">
                        <div className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Landmark size={18} />
                        </div>
                        <div>
                            <p className="text-[1.02rem] font-semibold tracking-[-0.03em]">Harbor Ledger</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Checkout</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-[#171d27]">
                            <button
                                type="button"
                                onClick={() => setLanguage('zh')}
                                className={`rounded-full px-3 py-2 text-xs font-medium transition ${language === 'zh' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                中文
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={`rounded-full px-3 py-2 text-xs font-medium transition ${language === 'en' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                EN
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-950 dark:border-white/10 dark:bg-[#171d27] dark:text-slate-300 dark:hover:text-white"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 pt-8">
                    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
                        <section className="surface-card overflow-hidden p-8">
                            <Link
                                to="/pricing"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                <ArrowLeft size={16} />
                                {copy.backPricing}
                            </Link>

                            <div className="mt-6">
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <Sparkles size={14} />
                                    {localizeBilling(plan.name, language)}
                                </div>
                                <h1 className="mt-5 text-[clamp(2.4rem,4vw,3.8rem)] font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
                                    {copy.title}
                                </h1>
                                <p className="mt-4 max-w-[60ch] text-base leading-8 text-slate-500 dark:text-slate-400">
                                    {copy.body}
                                </p>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                <CheckoutStat
                                    label={copy.summary}
                                    value={localizeBilling(plan.name, language)}
                                    note={localizeBilling(plan.strapline, language)}
                                />
                                <CheckoutStat
                                    label={copy.trial}
                                    value={plan.trialDays ? `${plan.trialDays} ${language === 'zh' ? '天' : 'days'}` : '—'}
                                    note={plan.trialDays ? copy.secure : localizeBilling(plan.finePrint, language)}
                                />
                            </div>

                            <div className="mt-8 rounded-[30px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.whatHappens}</p>
                                <div className="mt-4 space-y-3">
                                    {plan.features.map(feature => (
                                        <div key={feature.zh} className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            <Check size={15} className="mt-1 shrink-0 text-slate-900 dark:text-white" />
                                            <span>{localizeBilling(feature, language)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <aside className="surface-card p-8">
                            <div className="rounded-[34px] bg-[linear-gradient(180deg,#101827_0%,#0f172a_100%)] p-6 text-white">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/45">{copy.summary}</p>
                                        <p className="mt-4 text-[2.6rem] font-semibold tracking-[-0.05em]">{localizeBilling(plan.name, language)}</p>
                                    </div>
                                    <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/76">
                                        {cycleLabel}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    {price ? (
                                        <>
                                            <div className="flex items-end gap-3">
                                                <span className="text-xl text-white/52">A$</span>
                                                <p className="text-[4.2rem] font-semibold leading-none tracking-[-0.07em]">{price.launch}</p>
                                            </div>
                                            <p className="mt-2 text-sm text-white/58">
                                                {language === 'zh'
                                                    ? `${copy.restore} ${formatAud(price.regular)} / ${cycle === 'monthly' ? '月' : '年'}`
                                                    : `${copy.restore} ${formatAud(price.regular)} / ${cycle === 'monthly' ? 'month' : 'year'}`}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-end gap-3">
                                                <span className="text-xl text-white/52">A$</span>
                                                <p className="text-[4.2rem] font-semibold leading-none tracking-[-0.07em]">0</p>
                                            </div>
                                            <p className="mt-2 text-sm text-white/58">{localizeBilling(plan.finePrint, language)}</p>
                                        </>
                                    )}
                                </div>

                                <div className="mt-8 space-y-3">
                                    {copy.notes.map(note => (
                                        <div key={note} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-6 text-white/72">
                                            <ShieldCheck size={16} className="mt-1 shrink-0 text-white" />
                                            <span>{note}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 space-y-3">
                                    {checkoutLink ? (
                                        <a
                                            href={checkoutLink}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                                        >
                                            <LockKeyhole size={16} />
                                            {copy.payNow}
                                            <ArrowUpRight size={15} />
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/16 px-5 py-3 text-sm font-semibold text-white/48"
                                        >
                                            <LockKeyhole size={16} />
                                            {copy.unavailable}
                                        </button>
                                    )}

                                    {CUSTOMER_PORTAL_URL ? (
                                        <a
                                            href={CUSTOMER_PORTAL_URL}
                                            className="inline-flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/78 transition hover:text-white"
                                        >
                                            {copy.manage}
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}

function CheckoutStat({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}
