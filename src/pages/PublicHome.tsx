import { type CSSProperties, useEffect, useState } from 'react';
import {
    ArrowRight,
    ChartColumnIncreasing,
    Landmark,
    Languages,
    MoonStar,
    ShieldCheck,
    SunMedium,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';

type StoryBeat = {
    eyebrow: string;
    title: string;
    body: string;
    detail: string;
    previewTitle: string;
    previewBody: string;
    previewTag: string;
    bars: [string, string];
    metricLabel: string;
    metricValue: string;
};

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
        glimpseLabel: string;
        glimpseTitle: string;
        glimpseBody: string;
    };
    story: {
        eyebrow: string;
        stickyLabel: string;
        stickyTitle: string;
        stickyBody: string;
        stickyFoot: string;
        beats: StoryBeat[];
    };
    manifesto: {
        eyebrow: string;
        title: string;
        body: string;
        quote: string;
        points: string[];
    };
    start: {
        eyebrow: string;
        title: string;
        body: string;
        steps: Array<{
            step: string;
            title: string;
            body: string;
        }>;
        sideEyebrow: string;
        sideTitle: string;
        sideBody: string;
        sidePoints: string[];
        sideButton: string;
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
            kicker: 'A story page for your personal assets',
            title: '一眼看清你的总资产',
            nowrapTitle: true,
            subtitle: '不是记账，不是流水，而是一个真正可用的资产总览。',
            body: 'Harbor Ledger 先帮你回答眼前最重要的问题: 你现在有多少钱，钱分散在哪里，这个月的节奏稳不稳。它更像一张干净的资产桌面，而不是一套沉重的记账系统。',
            pills: ['无需注册', '默认本地保存', '支持 6 种货币', '银行卡 / 钱包 / 券商统一总览'],
            primaryCta: '立即打开工作台',
            secondaryCta: '先看预算提醒',
            glimpseLabel: '打开后先看到',
            glimpseTitle: '总览、预算和报表',
            glimpseBody: '三块核心页面直接可用，不需要额外设置。',
        },
        story: {
            eyebrow: '向下滚动',
            stickyLabel: '滚动叙事',
            stickyTitle: '每次往下，都应该更接近产品本身',
            stickyBody: '这页不是 dashboard 的缩略图，而是一段完整介绍。它先把核心体验讲清楚，再把人带进产品里。',
            stickyFoot: '现在这张卡会随着滚动变化。',
            beats: [
                {
                    eyebrow: '01 先知道钱在哪',
                    title: '先把分散在不同账户里的钱，收回同一张桌面里',
                    body: '不需要先补完流水，也不需要先重建分类。你只要填入当前余额，就能得到一张真实、直接、不会绕远路的总览。',
                    detail: '这一步讲的是进入产品前最核心的心智: 先看清，再决定要不要做更复杂的维护。',
                    previewTitle: '总资产总览',
                    previewBody: '最大账户、当前焦点、多币种估值',
                    previewTag: '先看到',
                    bars: ['86%', '58%'],
                    metricLabel: '最大账户占比',
                    metricValue: '42%',
                },
                {
                    eyebrow: '02 再判断这个月稳不稳',
                    title: '预算提醒只盯最重要的几件事，不拿复杂流程吓人',
                    body: '收入、房租、生活费和安全线足够组成第一版判断。它不是一个重型预算系统，而是一个帮助你迅速校准的信号层。',
                    detail: '这一步把“要不要担心这个月”说清楚，不让用户陷入一层又一层复杂设置。',
                    previewTitle: '预算提醒',
                    previewBody: '收入、房租、生活费与安全线',
                    previewTag: '再判断',
                    bars: ['72%', '48%'],
                    metricLabel: '本月安全线',
                    metricValue: '已设置',
                },
                {
                    eyebrow: '03 最后再复核结构',
                    title: '报表和检查是收尾，不是把人挡在门外的门槛',
                    body: '当总览顺了，报表就应该成为复核出口。零余额账户、覆盖币种、导出入口这些动作，都应该在最后顺势出现。',
                    detail: '这一步对应 Apple 风格页面最重要的一点: 节奏是被引导出来的，而不是被一堆卡片平铺出来的。',
                    previewTitle: '报表与检查',
                    previewBody: '零余额账户、币种覆盖与导出',
                    previewTag: '最后复核',
                    bars: ['92%', '66%'],
                    metricLabel: '复核页准备度',
                    metricValue: 'Ready',
                },
            ],
        },
        manifesto: {
            eyebrow: '页面气质',
            title: '首页应该像一个产品介绍页，而不是把功能卡片全都先摆给你看',
            body: '这也是我这次重新调整方向的原因。首页的任务不是模拟内部 dashboard，而是让用户在滚动里逐步理解产品节奏、视觉气质和价值密度。',
            quote: '先让首页像产品，再让功能页去证明产品。',
            points: [
                '大段留白比密集卡片更有高级感',
                '滚动节奏比平铺说明更像真实产品发布页',
                '视觉先建立信任，功能再建立留存',
            ],
        },
        start: {
            eyebrow: '真正进入前',
            title: '第一次打开，也应该是顺的',
            body: '介绍页讲完以后，真正点进来只需要三步。入口、层级和按钮都应该比之前更克制，而不是让人一进来就看见一堆模块。',
            steps: [
                {
                    step: '01',
                    title: '把常用账户余额改成真实数字',
                    body: '从银行卡、电子钱包和券商开始，不需要先补流水。',
                },
                {
                    step: '02',
                    title: '补上预算提醒里的关键数据',
                    body: '净收入、房租、生活费和安全线填完，就能得到第一版判断。',
                },
                {
                    step: '03',
                    title: '回到总览和报表复核一遍',
                    body: '看总资产、币种分布和账户结构是不是顺手。',
                },
            ],
            sideEyebrow: '下一步',
            sideTitle: '先把介绍页做好，再慢慢抠里面的功能页',
            sideBody: '这次我先把首页方向扳正成品牌介绍页。你确认这条路对了，我们再继续往 dashboard、预算页和报表页里抠细节。',
            sidePoints: [
                '首页先负责讲价值和氛围',
                '功能页再负责效率和维护逻辑',
                '这比一开始就把模块全堆出来更专业',
            ],
            sideButton: '进入产品',
        },
        locale: {
            zh: '中文',
            en: 'EN',
        },
    },
    en: {
        header: {
            tagline: 'A lighter, calmer, local-first view of your personal assets',
            reports: 'View reports',
            open: 'Open web app',
            themeLabel: 'Toggle light and dark theme',
        },
        hero: {
            badge: 'Local first',
            kicker: 'A story-led landing page',
            title: 'See your assets at a glance',
            nowrapTitle: false,
            subtitle: 'Not bookkeeping. Not transactions. A usable asset overview.',
            body: 'Harbor Ledger answers the questions that matter first: how much you have right now, where it sits, and whether this month still feels stable. It behaves more like a clean asset desk than a heavy accounting system.',
            pills: ['No sign-up', 'Saved locally', '6 currencies supported', 'Banks, wallets, and brokers in one place'],
            primaryCta: 'Open the workspace',
            secondaryCta: 'Preview budget',
            glimpseLabel: 'What opens first',
            glimpseTitle: 'Overview, budget, and reports',
            glimpseBody: 'The three core pages are already ready to use.',
        },
        story: {
            eyebrow: 'Scroll down',
            stickyLabel: 'Story-driven layout',
            stickyTitle: 'Each scroll step should feel closer to the product',
            stickyBody: 'This page is not a miniature dashboard. It is a guided introduction that explains the core experience before sending people into the app.',
            stickyFoot: 'The preview changes while you scroll.',
            beats: [
                {
                    eyebrow: '01 Understand where your money is',
                    title: 'Bring balances scattered across different accounts back into one clear surface',
                    body: 'No need to backfill every transaction and no need to rebuild your category structure first. Enter current balances and get a clean overview immediately.',
                    detail: 'This section sets the first mental model: understand first, then decide whether heavier maintenance is worth it.',
                    previewTitle: 'Asset overview',
                    previewBody: 'Largest account, current focus, multi-currency value',
                    previewTag: 'See first',
                    bars: ['86%', '58%'],
                    metricLabel: 'Largest holding',
                    metricValue: '42%',
                },
                {
                    eyebrow: '02 Decide whether the month still feels steady',
                    title: 'The budget layer focuses on the few questions that matter',
                    body: 'Income, rent, living costs, and your safety line are enough for the first judgment. This is not a heavy budget system. It is a fast signal layer.',
                    detail: 'It answers whether the month still feels safe without burying people in setup.',
                    previewTitle: 'Budget check',
                    previewBody: 'Income, rent, living costs, and safety line',
                    previewTag: 'Judge next',
                    bars: ['72%', '48%'],
                    metricLabel: 'Safety line',
                    metricValue: 'Set',
                },
                {
                    eyebrow: '03 Review the structure at the end',
                    title: 'Reports should feel like a finishing pass, not a gatekeeping wall',
                    body: 'Once the overview feels right, reports become the review exit. Zero-balance accounts, currency coverage, and export actions belong at the end of the flow.',
                    detail: 'This is one of the most useful lessons from Apple-like storytelling pages: rhythm is guided, not flatly listed.',
                    previewTitle: 'Reports and checks',
                    previewBody: 'Zero-balance accounts, currency coverage, export',
                    previewTag: 'Review last',
                    bars: ['92%', '66%'],
                    metricLabel: 'Review page state',
                    metricValue: 'Ready',
                },
            ],
        },
        manifesto: {
            eyebrow: 'Visual direction',
            title: 'The first page should feel like a product introduction, not a wall of feature modules',
            body: 'That is why the direction changed here. The landing page should build trust through pacing, scale, and atmosphere before it starts explaining internal screens.',
            quote: 'Make the first page feel like a product. Let the internal pages prove the product later.',
            points: [
                'Large whitespace feels more premium than dense card stacks',
                'Guided scrolling feels closer to a real product launch page',
                'Visual trust should come before operational complexity',
            ],
        },
        start: {
            eyebrow: 'Before entering',
            title: 'The first in-app step should still feel calm',
            body: 'Once the introduction is done, entering the product should take only three steps. The point is to keep the entry sequence more restrained than before.',
            steps: [
                {
                    step: '01',
                    title: 'Replace the starter balances with real ones',
                    body: 'Start with bank cards, wallets, and brokers. No need to backfill transactions.',
                },
                {
                    step: '02',
                    title: 'Add the key budget numbers',
                    body: 'Net income, rent, living costs, and the safety line are enough for the first judgment.',
                },
                {
                    step: '03',
                    title: 'Review the overview and report pages',
                    body: 'Check whether total value, currency spread, and structure feel right.',
                },
            ],
            sideEyebrow: 'Next step',
            sideTitle: 'Finish the introduction page first, then refine the inner pages',
            sideBody: 'This pass corrects the direction of the landing page into something closer to a real brand introduction. Once this feels right, we can return to the dashboard, budget, and report screens.',
            sidePoints: [
                'The landing page should explain value and atmosphere first',
                'The functional pages can focus on speed and maintenance later',
                'That feels more professional than leading with modules',
            ],
            sideButton: 'Enter the app',
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
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);

    useEffect(() => {
        saveSiteLanguage(language);
    }, [language]);

    useEffect(() => {
        const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-story-step]'));
        if (!sections.length) return undefined;

        const observer = new IntersectionObserver(
            entries => {
                const visible = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];

                if (!visible) return;
                const nextIndex = Number(visible.target.getAttribute('data-story-step') ?? 0);
                if (!Number.isNaN(nextIndex)) {
                    setActiveStoryIndex(nextIndex);
                }
            },
            {
                rootMargin: '-34% 0px -34% 0px',
                threshold: [0.25, 0.5, 0.75],
            },
        );

        sections.forEach(section => observer.observe(section));
        return () => observer.disconnect();
    }, [language]);

    const copy = COPY[language];
    const activeStory = copy.story.beats[activeStoryIndex] ?? copy.story.beats[0];

    return (
        <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(26,31,38,0.05),transparent_24%),radial-gradient(circle_at_top_right,rgba(178,181,189,0.16),transparent_30%),linear-gradient(180deg,#f7f5ef_0%,#f2f0eb_42%,#ffffff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_24%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_18%),linear-gradient(180deg,#111216_0%,#15171a_48%,#181b20_100%)] dark:text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-[1520px] flex-col px-5 pb-16 pt-5 sm:px-6 lg:px-8">
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
                    <section className="grid min-h-[calc(100vh-140px)] items-stretch gap-6 min-[1380px]:grid-cols-[minmax(0,1.26fr)_440px]">
                        <div
                            className="landing-motion relative overflow-hidden rounded-[42px] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.97)_0%,rgba(250,247,240,0.92)_100%)] px-8 py-10 shadow-[0_28px_76px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(145deg,rgba(28,29,33,0.96)_0%,rgba(18,19,22,0.95)_100%)] sm:px-10 sm:py-12"
                            style={delayStyle(90)}
                        >
                            <div className="landing-drift absolute -left-8 top-16 size-52 rounded-full bg-stone-200/70 blur-3xl dark:bg-white/4" />
                            <div className="landing-drift absolute right-0 top-10 size-60 rounded-full bg-white/70 blur-3xl dark:bg-white/3" style={{ animationDelay: '1.6s' }} />

                            <div className="relative flex h-full flex-col justify-between">
                                <div>
                                    <div className="landing-motion inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] text-white dark:bg-white dark:text-slate-950" style={delayStyle(140)}>
                                        <ShieldCheck size={14} />
                                        {copy.hero.badge}
                                    </div>

                                    <p className="landing-motion mt-8 text-[11px] font-medium tracking-[0.18em] text-slate-400 dark:text-slate-500" style={delayStyle(190)}>
                                        {copy.hero.kicker}
                                    </p>

                                    <h1
                                        className={`landing-motion editorial-title mt-5 text-[clamp(3.2rem,5.6vw,5.8rem)] leading-[0.96] text-slate-950 dark:text-white ${copy.hero.nowrapTitle ? 'lg:whitespace-nowrap' : 'max-w-[12ch]'}`}
                                        style={delayStyle(240)}
                                    >
                                        {copy.hero.title}
                                    </h1>

                                    <p className="landing-motion mt-5 max-w-[32rem] text-[1.35rem] font-medium leading-8 tracking-[-0.03em] text-slate-700 dark:text-slate-200" style={delayStyle(300)}>
                                        {copy.hero.subtitle}
                                    </p>

                                    <p className="landing-motion mt-6 max-w-[44rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300" style={delayStyle(360)}>
                                        {copy.hero.body}
                                    </p>

                                    <div className="landing-motion mt-7 flex flex-wrap gap-3" style={delayStyle(420)}>
                                        {copy.hero.pills.map(label => (
                                            <InfoPill key={label} label={label} />
                                        ))}
                                    </div>
                                </div>

                                <div className="landing-motion mt-10 flex flex-wrap items-center gap-4" style={delayStyle(480)}>
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
                            </div>
                        </div>

                        <aside
                            className="landing-motion relative overflow-hidden rounded-[42px] border border-slate-900/10 bg-[linear-gradient(180deg,#171921_0%,#111318_100%)] px-6 py-6 text-white shadow-[0_30px_72px_rgba(15,23,42,0.18)] dark:border-white/8"
                            style={delayStyle(180)}
                        >
                            <div className="landing-drift absolute -bottom-10 -right-10 size-56 rounded-full bg-white/6 blur-3xl" />
                            <div className="relative flex h-full flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-slate-200">
                                        <ChartColumnIncreasing size={13} />
                                        {copy.hero.glimpseLabel}
                                    </div>
                                    <h2 className="editorial-title mt-5 max-w-[11ch] text-[2.3rem] leading-[1.08] text-white">
                                        {copy.hero.glimpseTitle}
                                    </h2>
                                    <p className="mt-4 max-w-[19rem] text-sm leading-7 text-slate-300">
                                        {copy.hero.glimpseBody}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {copy.story.beats.map((beat, index) => (
                                        <div
                                            key={beat.title}
                                            className={`landing-motion rounded-[24px] border px-4 py-4 transition-all duration-500 ${index === activeStoryIndex ? 'border-white/16 bg-white/10 shadow-[0_14px_32px_rgba(0,0,0,0.16)]' : 'border-white/8 bg-white/[0.04]'}`}
                                            style={delayStyle(260 + index * 80)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{beat.previewTitle}</p>
                                                    <p className="mt-1 text-[13px] leading-5 text-slate-300">{beat.previewBody}</p>
                                                </div>
                                                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-medium text-slate-200">
                                                    {beat.previewTag}
                                                </span>
                                            </div>
                                            <div className="mt-3.5 h-2 rounded-full bg-white/10">
                                                <div className={`h-full rounded-full bg-white ${index === activeStoryIndex ? beat.bars[0] : 'w-[38%]'} transition-all duration-700`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className="grid gap-8 min-[1200px]:grid-cols-[460px_minmax(0,1fr)]">
                        <div className="landing-motion min-[1200px]:sticky min-[1200px]:top-28 min-[1200px]:h-[calc(100vh-130px)]" style={delayStyle(120)}>
                            <div className="flex h-full flex-col justify-between rounded-[42px] border border-slate-900/10 bg-[linear-gradient(180deg,#171921_0%,#111318_100%)] px-6 py-6 text-white shadow-[0_28px_62px_rgba(15,23,42,0.18)] dark:border-white/8">
                                <div>
                                    <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400">{copy.story.stickyLabel}</p>
                                    <h2 className="editorial-title mt-4 max-w-[12ch] text-[2rem] leading-[1.1] text-white">
                                        {copy.story.stickyTitle}
                                    </h2>
                                    <p className="mt-4 max-w-[19rem] text-sm leading-7 text-slate-300">
                                        {copy.story.stickyBody}
                                    </p>
                                </div>

                                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5">
                                    <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400">{copy.story.eyebrow}</p>
                                    <div className="mt-4">
                                        <p className="text-[12px] font-medium text-slate-400">{activeStory.eyebrow}</p>
                                        <p className="mt-2 text-[1.35rem] font-medium tracking-[-0.03em] text-white">{activeStory.previewTitle}</p>
                                        <p className="mt-2 text-sm leading-7 text-slate-300">{activeStory.previewBody}</p>
                                    </div>
                                    <div className="mt-5 space-y-3">
                                        <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[12px] font-medium text-slate-300">{activeStory.metricLabel}</span>
                                                <span className="text-[12px] font-medium text-white">{activeStory.metricValue}</span>
                                            </div>
                                            <div className="mt-3 h-2 rounded-full bg-white/10">
                                                <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: activeStory.bars[0] }} />
                                            </div>
                                        </div>
                                        <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[12px] font-medium text-slate-300">页面状态</span>
                                                <span className="text-[12px] font-medium text-white">{activeStory.previewTag}</span>
                                            </div>
                                            <div className="mt-3 h-2 rounded-full bg-white/10">
                                                <div className="h-full rounded-full bg-white/80 transition-all duration-700" style={{ width: activeStory.bars[1] }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-400">{copy.story.stickyFoot}</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {copy.story.beats.map((beat, index) => (
                                <article
                                    key={beat.title}
                                    data-story-step={index}
                                    className="landing-motion flex min-h-[82vh] items-center"
                                    style={delayStyle(120 + index * 80)}
                                >
                                    <div className={`w-full rounded-[44px] border px-8 py-12 shadow-[0_18px_42px_rgba(15,23,42,0.05)] backdrop-blur-sm md:px-12 ${index % 2 === 0 ? 'border-white/70 bg-[linear-gradient(145deg,#fffdfa_0%,#f7f2ea_100%)] dark:border-white/8 dark:bg-[linear-gradient(145deg,#1b1d22_0%,#14161a_100%)]' : 'border-slate-200 bg-white/88 dark:border-white/8 dark:bg-[#17191d]/86'}`}>
                                        <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400 dark:text-slate-500">{beat.eyebrow}</p>
                                        <h3 className="editorial-title mt-5 max-w-[12ch] text-[clamp(2.6rem,4.2vw,4.3rem)] leading-[1.04] text-slate-950 dark:text-white">
                                            {beat.title}
                                        </h3>
                                        <p className="mt-6 max-w-[42rem] text-[1.06rem] leading-8 text-slate-600 dark:text-slate-300">
                                            {beat.body}
                                        </p>
                                        <p className="mt-5 max-w-[36rem] text-sm leading-8 text-slate-500 dark:text-slate-400">
                                            {beat.detail}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="landing-motion relative min-h-[88vh] overflow-hidden rounded-[46px] border border-slate-900/10 bg-[linear-gradient(180deg,#15171c_0%,#0f1115_100%)] px-8 py-12 text-white shadow-[0_32px_80px_rgba(15,23,42,0.2)] dark:border-white/8 sm:px-12" style={delayStyle(100)}>
                        <div className="landing-drift absolute -left-20 top-20 size-72 rounded-full bg-white/6 blur-3xl" />
                        <div className="landing-drift absolute right-0 top-0 size-80 rounded-full bg-white/5 blur-3xl" style={{ animationDelay: '2s' }} />

                        <div className="relative flex h-full flex-col justify-between gap-10">
                            <div>
                                <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400">{copy.manifesto.eyebrow}</p>
                                <h2 className="editorial-title mt-6 max-w-[14ch] text-[clamp(3rem,5vw,5.4rem)] leading-[1.04] text-white">
                                    {copy.manifesto.title}
                                </h2>
                                <p className="mt-6 max-w-[42rem] text-[1.02rem] leading-8 text-slate-300">
                                    {copy.manifesto.body}
                                </p>
                            </div>

                            <div className="grid gap-6 min-[1180px]:grid-cols-[minmax(0,1fr)_360px]">
                                <div className="rounded-[34px] border border-white/10 bg-white/5 px-6 py-6 backdrop-blur-sm">
                                    <p className="editorial-title max-w-[18ch] text-[2rem] leading-[1.18] text-white">
                                        {copy.manifesto.quote}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {copy.manifesto.points.map(point => (
                                        <div key={point} className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-300">
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid min-h-[78vh] gap-6 min-[1240px]:grid-cols-[minmax(0,1.1fr)_380px]">
                        <div
                            className="landing-motion rounded-[40px] border border-white/70 bg-[linear-gradient(145deg,#fffdfa_0%,#f8f5ee_100%)] px-8 py-10 shadow-[0_20px_46px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-[linear-gradient(145deg,#1b1d22_0%,#15171b_100%)]"
                            style={delayStyle(120)}
                        >
                            <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.start.eyebrow}</p>
                            <h2 className="editorial-title mt-5 max-w-[14ch] text-[2.4rem] leading-[1.12] text-slate-950 dark:text-white">
                                {copy.start.title}
                            </h2>
                            <p className="mt-4 max-w-[44rem] text-sm leading-8 text-slate-600 dark:text-slate-300">
                                {copy.start.body}
                            </p>

                            <div className="mt-8 space-y-4">
                                {copy.start.steps.map((step, index) => (
                                    <div
                                        key={step.step}
                                        className="landing-motion rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] dark:border-white/8 dark:bg-[#17191d]"
                                        style={delayStyle(220 + index * 90)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-medium text-white dark:bg-white dark:text-slate-950">
                                                {step.step}
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium tracking-[-0.03em] text-slate-950 dark:text-white">{step.title}</p>
                                                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside
                            className="landing-motion flex flex-col justify-between rounded-[40px] border border-slate-200 bg-white/88 px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-[#17191d]/86"
                            style={delayStyle(220)}
                        >
                            <div>
                                <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.start.sideEyebrow}</p>
                                <h3 className="editorial-title mt-4 text-[1.9rem] leading-[1.18] text-slate-950 dark:text-white">
                                    {copy.start.sideTitle}
                                </h3>
                                <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
                                    {copy.start.sideBody}
                                </p>
                                <div className="mt-6 space-y-3">
                                    {copy.start.sidePoints.map(point => (
                                        <div key={point} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600 dark:border-white/8 dark:bg-[#111318] dark:text-slate-300">
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link
                                to="/dashboard"
                                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-90 dark:bg-white dark:text-slate-950"
                            >
                                {copy.start.sideButton}
                                <ArrowRight size={16} />
                            </Link>
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
