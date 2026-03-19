import { type CSSProperties, useEffect, useState } from 'react';
import {
    ArrowRight,
    ChartColumnIncreasing,
    Globe,
    Landmark,
    Languages,
    Lock,
    MoonStar,
    PiggyBank,
    ShieldCheck,
    SunMedium,
    WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';

type CopySchema = {
    header: {
        tagline: string;
        reports: string;
        open: string;
        themeLabel: string;
    };
    hero: {
        badge: string;
        kicker: string;
        title: string;
        nowrapTitle: boolean;
        subtitle: string;
        body: string;
        pills: string[];
        primaryCta: string;
        secondaryCta: string;
        surfaces: Array<{
            eyebrow: string;
            title: string;
            body: string;
            tone: 'light' | 'soft' | 'dark';
        }>;
    };
    snapshot: {
        eyebrow: string;
        title: string;
        panels: Array<{
            title: string;
            body: string;
            tag: string;
            widthClass: string;
        }>;
        metrics: Array<{
            label: string;
            value: string;
            note: string;
        }>;
    };
    rhythm: {
        eyebrow: string;
        title: string;
        body: string;
        bullets: string[];
        quoteLabel: string;
        quote: string;
    };
    featureCards: Array<{
        eyebrow: string;
        title: string;
        body: string;
        tone: 'light' | 'soft' | 'dark';
        icon: 'wallet' | 'globe' | 'budget' | 'lock';
    }>;
    steps: {
        eyebrow: string;
        title: string;
        body: string;
        items: Array<{
            step: string;
            title: string;
            body: string;
        }>;
        sideTitle: string;
        sidePoints: string[];
        sideCtaLabel: string;
        sideCtaTitle: string;
        sideCtaBody: string;
        sideCtaButton: string;
    };
    locale: {
        zh: string;
        en: string;
    };
};

const COPY: Record<SiteLanguage, CopySchema> = {
    zh: {
        header: {
            tagline: '轻量、克制、本地优先的个人资产总览',
            reports: '查看报表页',
            open: '打开网页版',
            themeLabel: '切换明暗主题',
        },
        hero: {
            badge: '本地优先',
            kicker: '更轻的个人资产工作台',
            title: '一眼看清你的总资产',
            nowrapTitle: true,
            subtitle: '不记流水，也能知道钱在哪。',
            body: 'Harbor Ledger 把分散在银行卡、钱包和券商里的余额，整理回一个清楚的总览。你维护的是当前状态，而不是一整本复杂账本。',
            pills: ['无需注册', '默认本地保存', '支持 6 种货币', '银行卡 / 钱包 / 券商统一总览'],
            primaryCta: '立即打开工作台',
            secondaryCta: '先看预算提醒',
            surfaces: [
                {
                    eyebrow: '直接看到',
                    title: '总资产总览',
                    body: '最大账户、当前焦点和多币种估值都在第一屏。',
                    tone: 'light',
                },
                {
                    eyebrow: '快速判断',
                    title: '预算提醒',
                    body: '填完收入、房租和生活费，就能马上知道这个月的压力区间。',
                    tone: 'soft',
                },
                {
                    eyebrow: '复核出口',
                    title: '报表与检查',
                    body: '零余额账户、覆盖币种和导出入口放在一起，复核更快。',
                    tone: 'dark',
                },
            ],
        },
        snapshot: {
            eyebrow: '打开就看到',
            title: '总览、预算和报表，一打开就都在',
            panels: [
                {
                    title: '总资产总览',
                    body: '多币种折算、最大账户和当前焦点',
                    tag: '一打开就有',
                    widthClass: 'w-[84%]',
                },
                {
                    title: '预算提醒',
                    body: '收入、房租、生活费和安全线',
                    tag: '填完就判断',
                    widthClass: 'w-[63%]',
                },
                {
                    title: '报表复核',
                    body: '零余额账户、覆盖币种和导出入口',
                    tag: '适合检查',
                    widthClass: 'w-[74%]',
                },
            ],
            metrics: [
                {
                    label: '支持币种',
                    value: '6',
                    note: 'AUD / CNY / USD / SGD / HKD / MYR',
                },
                {
                    label: '云端账号',
                    value: '0',
                    note: '当前版本默认不上传个人资产',
                },
                {
                    label: '核心页面',
                    value: '3',
                    note: '总览、预算、报表直接可用',
                },
            ],
        },
        rhythm: {
            eyebrow: '为什么它更顺手',
            title: '把注意力留给余额、预算和结构，不浪费在维护动作上',
            body: '这不是传统记账工具，也不试图替你接银行。它更像一张干净的资产桌面，帮你把重点放回现在最重要的数字。',
            bullets: [
                '不要求你先补完流水',
                '不要求你先建完整分类体系',
                '先把最常用的账户和预算填好，就能开始',
            ],
            quoteLabel: '默认逻辑',
            quote: '先清楚，再扩展。先让页面顺手，再决定要不要做更重的自动化。',
        },
        featureCards: [
            {
                eyebrow: '多币种',
                title: '不同币种放进同一个总览',
                body: '不用在多个 App 之间来回切换，常用币种可以直接折算并排比较。',
                tone: 'soft',
                icon: 'globe',
            },
            {
                eyebrow: '预算',
                title: '只回答最重要的几件事',
                body: '预算提醒盯的是收入、房租、生活费和安全线，不会要求你做重型预算。',
                tone: 'light',
                icon: 'budget',
            },
            {
                eyebrow: '隐私',
                title: '默认留在你的浏览器里',
                body: '没有服务器账户库，也没有假的自动同步。这个版本先把可控感放在前面。',
                tone: 'dark',
                icon: 'lock',
            },
        ],
        steps: {
            eyebrow: '开始方式',
            title: '第一次用，三步就够',
            body: '先填最常用的账户，再补预算提醒，最后回到总览和报表核对。整个过程不需要重建结构。',
            items: [
                {
                    step: '01',
                    title: '把常用账户余额改成真实数字',
                    body: '先从银行卡、电子钱包和券商开始，不用先分类流水。',
                },
                {
                    step: '02',
                    title: '补上预算提醒里的关键数据',
                    body: '净收入、房租、生活费和安全线填完，就能得到当月判断。',
                },
                {
                    step: '03',
                    title: '回到总览和报表复核一遍',
                    body: '最后看一下总资产、币种分布和账户结构，确认这一版是不是顺手。',
                },
            ],
            sideTitle: '适合这样的人',
            sidePoints: [
                '想知道自己一共有多少钱，但不想维护完整流水的人',
                '银行卡、钱包和券商并存，需要一个统一总览的人',
                '经常在多币种之间切换，想快速看到真实资产结构的人',
            ],
            sideCtaLabel: '现在就能开始',
            sideCtaTitle: '直接进网页版开始维护',
            sideCtaBody: '不需要注册，也不会再看到试用倒计时或假的充值入口。你现在打开的就是可用版本。',
            sideCtaButton: '打开工作台',
        },
        locale: {
            zh: '中文',
            en: 'EN',
        },
    },
    en: {
        header: {
            tagline: 'A local-first, lighter way to see your personal assets',
            reports: 'View reports',
            open: 'Open web app',
            themeLabel: 'Toggle light and dark theme',
        },
        hero: {
            badge: 'Local first',
            kicker: 'A cleaner desk for personal money',
            title: 'See your assets at a glance',
            nowrapTitle: false,
            subtitle: 'No transaction logging. Still crystal clear.',
            body: 'Harbor Ledger pulls the balances scattered across bank cards, wallets, and brokers into one clean overview. You maintain the current state, not a full bookkeeping system.',
            pills: ['No sign-up', 'Saved locally', '6 currencies supported', 'Banks, wallets, and brokers in one view'],
            primaryCta: 'Open the workspace',
            secondaryCta: 'Preview budget',
            surfaces: [
                {
                    eyebrow: 'Visible first',
                    title: 'Asset overview',
                    body: 'Largest account, current focus, and multi-currency value on the first screen.',
                    tone: 'light',
                },
                {
                    eyebrow: 'Quick signal',
                    title: 'Budget check',
                    body: 'Income, rent, and living cost turn into an immediate monthly pressure read.',
                    tone: 'soft',
                },
                {
                    eyebrow: 'Review exit',
                    title: 'Reports and checks',
                    body: 'Zero-balance accounts, currency coverage, and export live in one place.',
                    tone: 'dark',
                },
            ],
        },
        snapshot: {
            eyebrow: 'What opens first',
            title: 'Overview, budget, and reports are already there',
            panels: [
                {
                    title: 'Asset overview',
                    body: 'FX conversion, biggest account, and current focus',
                    tag: 'Ready instantly',
                    widthClass: 'w-[84%]',
                },
                {
                    title: 'Budget check',
                    body: 'Income, rent, living costs, and safety line',
                    tag: 'Fill and decide',
                    widthClass: 'w-[63%]',
                },
                {
                    title: 'Report review',
                    body: 'Zero-balance accounts, coverage, and export',
                    tag: 'Built for review',
                    widthClass: 'w-[74%]',
                },
            ],
            metrics: [
                {
                    label: 'Currencies',
                    value: '6',
                    note: 'AUD / CNY / USD / SGD / HKD / MYR',
                },
                {
                    label: 'Cloud accounts',
                    value: '0',
                    note: 'This version does not upload personal asset data by default',
                },
                {
                    label: 'Core pages',
                    value: '3',
                    note: 'Overview, budget, and reports are ready to use',
                },
            ],
        },
        rhythm: {
            eyebrow: 'Why it feels lighter',
            title: 'Keep your attention on balances, budget, and structure',
            body: 'This is not a traditional bookkeeping tool and it does not try to connect every bank. It acts more like a clean asset desk, keeping the focus on the few numbers that matter right now.',
            bullets: [
                'No need to backfill old transactions',
                'No need to build a complete category system first',
                'Start with the few accounts and numbers you actually use',
            ],
            quoteLabel: 'Default logic',
            quote: 'Clarity first, expansion later. Make the page feel right before adding heavier automation.',
        },
        featureCards: [
            {
                eyebrow: 'Multi-currency',
                title: 'Keep different currencies in one overview',
                body: 'Compare your common currencies side by side instead of jumping across multiple apps.',
                tone: 'soft',
                icon: 'globe',
            },
            {
                eyebrow: 'Budget',
                title: 'Answer only the few questions that matter',
                body: 'The budget check focuses on income, rent, living costs, and your safety line.',
                tone: 'light',
                icon: 'budget',
            },
            {
                eyebrow: 'Privacy',
                title: 'Saved in your browser by default',
                body: 'No server-side account vault and no fake auto-sync. Control comes first in this version.',
                tone: 'dark',
                icon: 'lock',
            },
        ],
        steps: {
            eyebrow: 'How to start',
            title: 'Three steps for the first usable version',
            body: 'Fill the accounts you care about, add the key budget numbers, then review the overview and report pages. No need to rebuild your structure first.',
            items: [
                {
                    step: '01',
                    title: 'Replace the starter balances with real numbers',
                    body: 'Start with your main bank cards, wallets, and broker accounts.',
                },
                {
                    step: '02',
                    title: 'Add the key budget inputs',
                    body: 'Net income, rent, living costs, and the safety line are enough for the first judgment.',
                },
                {
                    step: '03',
                    title: 'Review the overview and report pages',
                    body: 'Make sure the total value, currency mix, and account structure feel right.',
                },
            ],
            sideTitle: 'Best for people who',
            sidePoints: [
                'Want to know how much they really have without maintaining a full ledger',
                'Need one place for banks, wallets, and brokers together',
                'Switch across currencies and want a fast structural overview',
            ],
            sideCtaLabel: 'Ready now',
            sideCtaTitle: 'Open the web version and start maintaining',
            sideCtaBody: 'No sign-up required, and no fake trial countdown or fake paywall in the way.',
            sideCtaButton: 'Open workspace',
        },
        locale: {
            zh: '中文',
            en: 'EN',
        },
    },
};

function delayStyle(ms: number): CSSProperties {
    return { '--enter-delay': `${ms}ms` } as CSSProperties;
}

export function PublicHome() {
    const { isDark, toggleTheme } = useTheme();
    const [language, setLanguage] = useState<SiteLanguage>(() => loadSiteLanguage());

    useEffect(() => {
        saveSiteLanguage(language);
    }, [language]);

    const copy = COPY[language];

    return (
        <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(26,31,38,0.05),transparent_24%),radial-gradient(circle_at_top_right,rgba(178,181,189,0.18),transparent_28%),linear-gradient(180deg,#f7f5ef_0%,#f0f2f4_46%,#ffffff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_24%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_18%),linear-gradient(180deg,#111216_0%,#15171b_48%,#191b20_100%)] dark:text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-[1460px] flex-col px-5 pb-16 pt-5 sm:px-6 lg:px-8">
                <header
                    className="landing-motion flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-white/70 bg-white/84 px-5 py-4 shadow-[0_18px_46px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/8 dark:bg-[#17191d]/84"
                    style={delayStyle(20)}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.14)] dark:bg-white dark:text-slate-950">
                            <Landmark size={20} />
                        </div>
                        <div>
                            <p className="text-base font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Harbor Ledger</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{copy.header.tagline}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-[#111318]">
                            <button
                                type="button"
                                onClick={() => setLanguage('zh')}
                                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition ${language === 'zh' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                <Languages size={13} />
                                {copy.locale.zh}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={`rounded-full px-3.5 py-2 text-xs font-medium transition ${language === 'en' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                {copy.locale.en}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={copy.header.themeLabel}
                            className="inline-flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-[#111318] dark:text-slate-300 dark:hover:text-white"
                        >
                            {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
                        </button>

                        <Link
                            to="/reports"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-[#111318] dark:text-slate-200 dark:hover:text-white"
                        >
                            {copy.header.reports}
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white shadow-[0_18px_30px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_36px_rgba(15,23,42,0.18)] dark:bg-white dark:text-slate-950"
                        >
                            {copy.header.open}
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </header>

                <main className="mt-8 space-y-8">
                    <section className="grid gap-6 min-[1380px]:grid-cols-[minmax(0,1.28fr)_450px]">
                        <div
                            className="landing-motion landing-lift relative overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(140deg,rgba(255,255,255,0.96)_0%,rgba(249,246,239,0.92)_100%)] p-7 shadow-[0_26px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(140deg,rgba(28,29,33,0.96)_0%,rgba(19,20,23,0.94)_100%)] sm:p-9"
                            style={delayStyle(90)}
                        >
                            <div className="landing-drift absolute -left-12 top-10 size-48 rounded-full bg-stone-200/70 blur-3xl dark:bg-white/4" />
                            <div className="landing-drift absolute right-6 top-0 size-56 rounded-full bg-white/70 blur-3xl dark:bg-white/3" style={{ animationDelay: '1.6s' }} />

                            <div className="relative">
                                <div className="landing-motion inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] text-white dark:bg-white dark:text-slate-950" style={delayStyle(130)}>
                                    <ShieldCheck size={14} />
                                    {copy.hero.badge}
                                </div>

                                <p className="landing-motion mt-7 text-[11px] font-medium tracking-[0.18em] text-slate-400 dark:text-slate-500" style={delayStyle(170)}>
                                    {copy.hero.kicker}
                                </p>

                                <h1
                                    className={`landing-motion editorial-title mt-4 max-w-[14ch] text-[clamp(3rem,5.2vw,5rem)] leading-[0.98] text-slate-950 dark:text-white lg:max-w-none ${copy.hero.nowrapTitle ? 'lg:whitespace-nowrap' : ''}`}
                                    style={delayStyle(210)}
                                >
                                    {copy.hero.title}
                                </h1>

                                <p className="landing-motion mt-4 text-[1.24rem] font-medium tracking-[-0.03em] text-slate-700 dark:text-slate-200" style={delayStyle(260)}>
                                    {copy.hero.subtitle}
                                </p>

                                <p className="landing-motion mt-5 max-w-[46rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300" style={delayStyle(300)}>
                                    {copy.hero.body}
                                </p>

                                <div className="landing-motion mt-6 flex flex-wrap gap-3" style={delayStyle(340)}>
                                    {copy.hero.pills.map(label => (
                                        <InfoPill key={label} label={label} />
                                    ))}
                                </div>

                                <div className="landing-motion mt-8 flex flex-wrap gap-3" style={delayStyle(380)}>
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_18px_34px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(15,23,42,0.2)] dark:bg-white dark:text-slate-950"
                                    >
                                        {copy.hero.primaryCta}
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        to="/budget"
                                        className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-[#17191d] dark:text-slate-200 dark:hover:text-white"
                                    >
                                        {copy.hero.secondaryCta}
                                    </Link>
                                </div>

                                <div className="mt-10 grid gap-4 lg:grid-cols-3">
                                    {copy.hero.surfaces.map((surface, index) => (
                                        <SurfaceCard
                                            key={surface.title}
                                            eyebrow={surface.eyebrow}
                                            title={surface.title}
                                            body={surface.body}
                                            tone={surface.tone}
                                            delay={430 + index * 80}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <aside
                            className="landing-motion landing-lift rounded-[38px] border border-slate-800/20 bg-[linear-gradient(180deg,#171921_0%,#12141a_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.16)] dark:border-white/8 dark:bg-[linear-gradient(180deg,#191c23_0%,#111318_100%)] sm:p-7"
                            style={delayStyle(160)}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-slate-200">
                                <ChartColumnIncreasing size={13} />
                                {copy.snapshot.eyebrow}
                            </div>

                            <h2 className="editorial-title mt-5 max-w-[13ch] text-[2.1rem] leading-[1.12] text-white">
                                {copy.snapshot.title}
                            </h2>

                            <div className="mt-6 space-y-3">
                                {copy.snapshot.panels.map((panel, index) => (
                                    <PreviewPanel
                                        key={panel.title}
                                        title={panel.title}
                                        body={panel.body}
                                        progress={panel.tag}
                                        widthClass={panel.widthClass}
                                        delay={250 + index * 90}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3 min-[1380px]:grid-cols-1">
                                {copy.snapshot.metrics.map((metric, index) => (
                                    <MetricTile
                                        key={metric.label}
                                        value={metric.value}
                                        label={metric.label}
                                        note={metric.note}
                                        delay={520 + index * 70}
                                    />
                                ))}
                            </div>
                        </aside>
                    </section>

                    <section className="grid gap-6 min-[1280px]:grid-cols-[minmax(0,1.04fr)_520px]">
                        <div
                            className="landing-motion overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(145deg,#fffdfa_0%,#f6f2ea_100%)] p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-[linear-gradient(145deg,#1b1d22_0%,#16181d_100%)] sm:p-8"
                            style={delayStyle(120)}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] text-slate-600 shadow-sm dark:bg-white/6 dark:text-slate-300">
                                <WalletCards size={14} />
                                {copy.rhythm.eyebrow}
                            </div>
                            <h2 className="editorial-title mt-5 max-w-[16ch] text-[2.25rem] leading-[1.12] text-slate-950 dark:text-white">
                                {copy.rhythm.title}
                            </h2>
                            <p className="mt-4 max-w-[42rem] text-sm leading-8 text-slate-600 dark:text-slate-300">
                                {copy.rhythm.body}
                            </p>

                            <div className="mt-7 grid gap-3 sm:grid-cols-3">
                                {copy.rhythm.bullets.map((bullet, index) => (
                                    <div
                                        key={bullet}
                                        className="landing-motion landing-lift rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-sm leading-7 text-slate-600 shadow-[0_12px_26px_rgba(15,23,42,0.04)] dark:border-white/8 dark:bg-[#15171c] dark:text-slate-300"
                                        style={delayStyle(240 + index * 80)}
                                    >
                                        {bullet}
                                    </div>
                                ))}
                            </div>

                            <div className="landing-motion mt-6 rounded-[28px] border border-slate-200 bg-slate-950 px-6 py-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] dark:border-white/8 dark:bg-[#101216]" style={delayStyle(500)}>
                                <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400">{copy.rhythm.quoteLabel}</p>
                                <p className="editorial-title mt-3 max-w-[20ch] text-[1.65rem] leading-[1.25] text-white">
                                    {copy.rhythm.quote}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {copy.featureCards.map((card, index) => (
                                <FeatureHighlight key={card.title} card={card} delay={180 + index * 100} />
                            ))}
                        </div>
                    </section>

                    <section className="grid gap-6 min-[1260px]:grid-cols-[minmax(0,1.04fr)_370px]">
                        <div
                            className="landing-motion rounded-[36px] border border-white/70 bg-white/88 p-7 shadow-[0_20px_48px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/8 dark:bg-[#17191d]/86 sm:p-8"
                            style={delayStyle(120)}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] text-slate-600 dark:bg-white/6 dark:text-slate-300">
                                <PiggyBank size={14} />
                                {copy.steps.eyebrow}
                            </div>

                            <h2 className="editorial-title mt-5 text-[2.1rem] leading-[1.15] text-slate-950 dark:text-white">
                                {copy.steps.title}
                            </h2>
                            <p className="mt-4 max-w-[44rem] text-sm leading-8 text-slate-600 dark:text-slate-300">
                                {copy.steps.body}
                            </p>

                            <div className="mt-8 space-y-4">
                                {copy.steps.items.map((step, index) => (
                                    <StepRow
                                        key={step.step}
                                        step={step.step}
                                        title={step.title}
                                        body={step.body}
                                        delay={220 + index * 100}
                                    />
                                ))}
                            </div>
                        </div>

                        <aside className="landing-motion rounded-[36px] border border-slate-200 bg-[linear-gradient(180deg,#faf9f6_0%,#ffffff_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-[linear-gradient(180deg,#1a1c22_0%,#14161a_100%)]" style={delayStyle(200)}>
                            <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.steps.sideTitle}</p>
                            <div className="mt-4 space-y-3">
                                {copy.steps.sidePoints.map((point, index) => (
                                    <div
                                        key={point}
                                        className="landing-motion rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600 dark:border-white/8 dark:bg-[#16181d] dark:text-slate-300"
                                        style={delayStyle(290 + index * 90)}
                                    >
                                        {point}
                                    </div>
                                ))}
                            </div>

                            <div className="landing-motion mt-6 rounded-[28px] bg-slate-950 px-5 py-5 text-white dark:bg-white dark:text-slate-950" style={delayStyle(560)}>
                                <p className="text-[11px] font-medium tracking-[0.18em] text-slate-300 dark:text-slate-500">{copy.steps.sideCtaLabel}</p>
                                <p className="editorial-title mt-3 text-[1.55rem] leading-[1.2] dark:text-slate-950">{copy.steps.sideCtaTitle}</p>
                                <p className="mt-3 text-sm leading-7 text-slate-300 dark:text-slate-600">{copy.steps.sideCtaBody}</p>
                                <Link
                                    to="/dashboard"
                                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5 hover:opacity-90 dark:bg-slate-950 dark:text-white"
                                >
                                    {copy.steps.sideCtaButton}
                                    <ArrowRight size={15} />
                                </Link>
                            </div>
                        </aside>
                    </section>
                </main>
            </div>
        </div>
    );
}

function InfoPill({ label }: { label: string }) {
    return (
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-[#17191d] dark:text-slate-300">
            {label}
        </div>
    );
}

function SurfaceCard({
    eyebrow,
    title,
    body,
    tone,
    delay,
}: {
    eyebrow: string;
    title: string;
    body: string;
    tone: 'light' | 'soft' | 'dark';
    delay: number;
}) {
    const toneClass =
        tone === 'dark'
            ? 'border-slate-900/10 bg-slate-950 text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)] dark:border-white/8 dark:bg-[#101216]'
            : tone === 'soft'
              ? 'border-stone-200 bg-stone-50 text-slate-950 dark:border-white/8 dark:bg-[#1c1e23] dark:text-white'
              : 'border-slate-200 bg-white text-slate-950 dark:border-white/8 dark:bg-[#15171c] dark:text-white';

    const noteClass = tone === 'dark' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400';
    const eyebrowClass = tone === 'dark' ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500';

    return (
        <div className={`landing-motion landing-lift rounded-[26px] border px-5 py-5 ${toneClass}`} style={delayStyle(delay)}>
            <p className={`text-[11px] font-medium tracking-[0.16em] ${eyebrowClass}`}>{eyebrow}</p>
            <p className="mt-3 text-[1.2rem] font-medium tracking-[-0.03em]">{title}</p>
            <p className={`mt-3 text-sm leading-7 ${noteClass}`}>{body}</p>
        </div>
    );
}

function PreviewPanel({
    title,
    body,
    progress,
    widthClass,
    delay,
}: {
    title: string;
    body: string;
    progress: string;
    widthClass: string;
    delay: number;
}) {
    return (
        <div className="landing-motion rounded-[24px] border border-white/10 bg-white/6 px-4 py-4" style={delayStyle(delay)}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-1 text-[13px] leading-5 text-slate-300">{body}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-medium text-slate-200">
                    {progress}
                </span>
            </div>
            <div className="mt-3.5 h-2 rounded-full bg-white/10">
                <div className={`h-full rounded-full bg-white ${widthClass}`} />
            </div>
        </div>
    );
}

function MetricTile({
    value,
    label,
    note,
    delay,
}: {
    value: string;
    label: string;
    note: string;
    delay: number;
}) {
    return (
        <div className="landing-motion rounded-[24px] border border-white/10 bg-white/6 px-4 py-4" style={delayStyle(delay)}>
            <p className="text-[11px] font-medium tracking-[0.16em] text-slate-300">{label}</p>
            <p className="mt-2.5 text-[1.9rem] font-medium tracking-[-0.04em] text-white">{value}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-300">{note}</p>
        </div>
    );
}

function FeatureHighlight({
    card,
    delay,
}: {
    card: CopySchema['featureCards'][number];
    delay: number;
}) {
    const icon = (() => {
        switch (card.icon) {
            case 'globe':
                return <Globe size={18} />;
            case 'budget':
                return <PiggyBank size={18} />;
            case 'lock':
                return <Lock size={18} />;
            default:
                return <WalletCards size={18} />;
        }
    })();

    const toneClass =
        card.tone === 'dark'
            ? 'border-slate-900/10 bg-slate-950 text-white shadow-[0_18px_36px_rgba(15,23,42,0.16)] dark:border-white/8 dark:bg-[#101216]'
            : card.tone === 'soft'
              ? 'border-stone-200 bg-[linear-gradient(145deg,#faf6ef_0%,#f3efe8_100%)] text-slate-950 dark:border-white/8 dark:bg-[linear-gradient(145deg,#1d1f25_0%,#17191d_100%)] dark:text-white'
              : 'border-slate-200 bg-white text-slate-950 dark:border-white/8 dark:bg-[#17191d] dark:text-white';

    const iconClass = card.tone === 'dark'
        ? 'bg-white/8 text-white'
        : 'bg-white text-slate-700 shadow-sm dark:bg-white/8 dark:text-slate-100';

    const noteClass = card.tone === 'dark' ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300';
    const eyebrowClass = card.tone === 'dark' ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500';

    return (
        <div className={`landing-motion landing-lift rounded-[34px] border p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${toneClass}`} style={delayStyle(delay)}>
            <div className={`flex size-11 items-center justify-center rounded-2xl ${iconClass}`}>
                {icon}
            </div>
            <p className={`mt-5 text-[11px] font-medium tracking-[0.18em] ${eyebrowClass}`}>{card.eyebrow}</p>
            <h3 className="editorial-title mt-3 text-[1.8rem] leading-[1.18]">{card.title}</h3>
            <p className={`mt-4 text-sm leading-8 ${noteClass}`}>{card.body}</p>
        </div>
    );
}

function StepRow({
    step,
    title,
    body,
    delay,
}: {
    step: string;
    title: string;
    body: string;
    delay: number;
}) {
    return (
        <div className="landing-motion landing-lift rounded-[28px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#faf8f2_100%)] px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-white/8 dark:bg-[linear-gradient(145deg,#1b1d22_0%,#15171c_100%)]" style={delayStyle(delay)}>
            <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-medium text-white dark:bg-white dark:text-slate-950">
                    {step}
                </div>
                <div>
                    <p className="text-lg font-medium tracking-[-0.03em] text-slate-950 dark:text-white">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
                </div>
            </div>
        </div>
    );
}
