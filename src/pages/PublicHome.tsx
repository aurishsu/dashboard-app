import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { ArrowRight, Languages, Landmark, MoonStar, SunMedium } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';

type StoryScene = {
    eyebrow: string;
    title: string;
    body: string;
    kicker: string;
    visual: 'overview' | 'budget' | 'review';
};

type CopySchema = {
    header: {
        open: string;
        themeLabel: string;
        localeZh: string;
        localeEn: string;
    };
    hero: {
        eyebrow: string;
        title: string;
        subtitle: string;
        body: string;
        primary: string;
        secondary: string;
    };
    scenes: StoryScene[];
    finale: {
        eyebrow: string;
        title: string;
        body: string;
        cta: string;
    };
};

const COPY: Record<SiteLanguage, CopySchema> = {
    zh: {
        header: {
            open: '进入产品',
            themeLabel: '切换明暗主题',
            localeZh: '中文',
            localeEn: 'EN',
        },
        hero: {
            eyebrow: 'Harbor Ledger',
            title: '把你的钱，看成一个整体。',
            subtitle: '不是记账，不是流水，而是一张更清楚的资产桌面。',
            body: '把银行卡、电子钱包和券商里的当前余额，放回同一张视图里。先看见，再判断。',
            primary: '立即体验',
            secondary: '继续往下',
        },
        scenes: [
            {
                eyebrow: '01 总览',
                title: '先看到全部，再看到重点。',
                body: '最大账户、多币种估值和当前焦点，应该同时出现在眼前，而不是被拆散在很多入口里。',
                kicker: '看的是全局，不是来回找页面。',
                visual: 'overview',
            },
            {
                eyebrow: '02 预算',
                title: '知道这个月，还稳不稳。',
                body: '把收入、房租、生活费和安全线放进去，月度压力应该立刻有答案，不该像填表一样费力。',
                kicker: '判断越直接，产品越让人放松。',
                visual: 'budget',
            },
            {
                eyebrow: '03 复核',
                title: '最后再检查，但一眼就能收尾。',
                body: '零余额账户、币种覆盖和导出入口，应该像顺手整理，而不是用完前的最后一道门槛。',
                kicker: '收尾越轻，越愿意长期打开。',
                visual: 'review',
            },
        ],
        finale: {
            eyebrow: 'Harbor Ledger',
            title: '先看清楚，再决定下一步。',
            body: '现在打开产品，把真实余额、预算判断和资产结构放回同一张桌面里。',
            cta: '打开产品',
        },
    },
    en: {
        header: {
            open: 'Open product',
            themeLabel: 'Toggle light and dark theme',
            localeZh: '中文',
            localeEn: 'EN',
        },
        hero: {
            eyebrow: 'Harbor Ledger',
            title: 'See your money as one whole.',
            subtitle: 'Not bookkeeping. Not transactions. A clearer surface for your assets.',
            body: 'Bring the balances in your cards, wallets, and broker accounts back into one view. See first. Judge next.',
            primary: 'Open now',
            secondary: 'Keep scrolling',
        },
        scenes: [
            {
                eyebrow: '01 Overview',
                title: 'See the whole picture before the details.',
                body: 'Your largest holding, FX-adjusted value, and current focus should live on one surface instead of hiding behind many entry points.',
                kicker: 'It should feel like seeing the whole map at once.',
                visual: 'overview',
            },
            {
                eyebrow: '02 Budget',
                title: 'Know whether this month still feels steady.',
                body: 'Income, rent, living costs, and your safety line should turn into an answer right away, not another form to complete.',
                kicker: 'The faster the signal, the calmer the product feels.',
                visual: 'budget',
            },
            {
                eyebrow: '03 Review',
                title: 'Leave checking for the end, but make it immediate.',
                body: 'Zero-balance accounts, currency coverage, and export should feel like a clean finishing pass, not one more barrier before you leave.',
                kicker: 'A lighter finish makes the product easier to reopen.',
                visual: 'review',
            },
        ],
        finale: {
            eyebrow: 'Harbor Ledger',
            title: 'See clearly first, decide the rest after.',
            body: 'Open the product and place your real balances, monthly signal, and asset structure back onto one surface.',
            cta: 'Enter product',
        },
    },
};

const STAGE_PALETTES = [
    {
        shell: 'bg-[linear-gradient(160deg,#faf7f0_0%,#efe8db_100%)] ring-black/6 shadow-[0_38px_100px_rgba(15,23,42,0.12)]',
        caption: 'text-slate-500',
        badge: 'bg-white/88 text-slate-950 ring-1 ring-black/6',
        surface: 'bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]',
        lineStrong: 'bg-slate-950',
        lineSoft: 'bg-slate-300',
        accent: 'bg-[#dfe7f2]',
    },
    {
        shell: 'bg-[linear-gradient(160deg,#101319_0%,#181b23_100%)] ring-white/8 shadow-[0_44px_120px_rgba(0,0,0,0.38)]',
        caption: 'text-slate-400',
        badge: 'bg-white/10 text-white ring-1 ring-white/10',
        surface: 'bg-white/6 shadow-[0_28px_80px_rgba(0,0,0,0.24)] ring-1 ring-white/10',
        lineStrong: 'bg-white',
        lineSoft: 'bg-white/28',
        accent: 'bg-[#222733]',
    },
    {
        shell: 'bg-[linear-gradient(160deg,#f8f3ea_0%,#ede5d7_100%)] ring-black/6 shadow-[0_38px_100px_rgba(15,23,42,0.12)]',
        caption: 'text-slate-500',
        badge: 'bg-white/88 text-slate-950 ring-1 ring-black/6',
        surface: 'bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.08)]',
        lineStrong: 'bg-slate-950',
        lineSoft: 'bg-slate-300',
        accent: 'bg-[#ebe2d4]',
    },
] as const;

function delayStyle(ms: number): CSSProperties {
    return { '--enter-delay': `${ms}ms` } as CSSProperties;
}

export function PublicHome() {
    const { isDark, toggleTheme } = useTheme();
    const [language, setLanguage] = useState<SiteLanguage>(() => loadSiteLanguage());
    const copy = COPY[language];

    useEffect(() => {
        saveSiteLanguage(language);
    }, [language]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f3ede2] text-slate-950 dark:bg-[#0f1013] dark:text-white">
            <header className="fixed inset-x-0 top-0 z-50">
                <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 rounded-full border border-white/60 bg-white/84 px-4 py-3 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/8 dark:bg-[#17191d]/84">
                        <div className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Landmark size={17} />
                        </div>
                        <p className="text-base font-semibold tracking-[-0.03em]">Harbor Ledger</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/84 px-2.5 py-2 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/8 dark:bg-[#17191d]/84">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-[#111318]">
                            <button
                                type="button"
                                onClick={() => setLanguage('zh')}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${language === 'zh' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                <Languages size={12} />
                                {copy.header.localeZh}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={`rounded-full px-3 py-2 text-xs font-medium transition ${language === 'en' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                {copy.header.localeEn}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={copy.header.themeLabel}
                            className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-[#111318] dark:text-slate-300 dark:hover:text-white"
                        >
                            {isDark ? <SunMedium size={17} /> : <MoonStar size={17} />}
                        </button>

                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                        >
                            {copy.header.open}
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-22">
                <HeroSection copy={copy.hero} language={language} />
                <StoryRail scenes={copy.scenes} />
                <FinalSection copy={copy.finale} />
            </main>
        </div>
    );
}

function HeroSection({ copy, language }: { copy: CopySchema['hero']; language: SiteLanguage }) {
    return (
        <section className="relative min-h-[108svh] overflow-hidden bg-[#06070b] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_18%_78%,rgba(89,102,129,0.18),transparent_22%),radial-gradient(circle_at_82%_72%,rgba(89,102,129,0.14),transparent_24%),linear-gradient(180deg,#05060a_0%,#0a0c10_100%)]" />
            <div className="absolute left-1/2 top-[18%] h-[34vw] w-[34vw] -translate-x-1/2 rounded-full bg-white/8 blur-[140px]" />

            <div className="relative mx-auto flex min-h-[108svh] max-w-[1560px] flex-col items-center justify-between px-5 pb-12 pt-22 text-center sm:px-6 lg:px-8 lg:pt-28">
                <div className="landing-motion max-w-[68rem]" style={delayStyle(80)}>
                    <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">{copy.eyebrow}</p>
                    <h1 className="mt-8 text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-white">
                        <span className={language === 'zh' ? 'lg:whitespace-nowrap' : ''}>{copy.title}</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-[18ch] text-[clamp(1.3rem,2vw,2rem)] font-medium leading-[1.3] tracking-[-0.035em] text-slate-200">
                        {copy.subtitle}
                    </p>
                    <p className="mx-auto mt-6 max-w-[34rem] text-[1rem] leading-8 text-slate-400">
                        {copy.body}
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5"
                        >
                            {copy.primary}
                            <ArrowRight size={15} />
                        </Link>
                        <a
                            href="#story-0"
                            className="inline-flex items-center rounded-full border border-white/12 px-6 py-3.5 text-sm font-medium text-slate-200 transition hover:border-white/24 hover:text-white"
                        >
                            {copy.secondary}
                        </a>
                    </div>
                </div>

                <div className="landing-motion relative mt-12 h-[42vw] max-h-[640px] min-h-[320px] w-full max-w-[1180px]" style={delayStyle(180)}>
                    <div className="landing-drift absolute left-1/2 top-[10%] h-[70%] w-[78%] -translate-x-1/2 rounded-[56px] bg-[linear-gradient(160deg,#1b1e26_0%,#0a0c10_100%)] shadow-[0_60px_160px_rgba(0,0,0,0.42)] ring-1 ring-white/8" />
                    <div className="landing-drift absolute left-[21%] top-[18%] h-[24%] w-[34%] rounded-[34px] bg-white/[0.05] backdrop-blur-sm ring-1 ring-white/10" style={{ animationDelay: '1.2s' }} />
                    <div className="landing-drift absolute right-[16%] top-[24%] h-[36%] w-[28%] rounded-[38px] bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/8" style={{ animationDelay: '2.1s' }} />
                    <div className="absolute left-[25%] top-[27%] h-2 w-[18%] rounded-full bg-white/84" />
                    <div className="absolute left-[25%] top-[34%] h-2 w-[12%] rounded-full bg-white/28" />
                    <div className="absolute left-[26%] top-[52%] h-[30%] w-[44%] rounded-[38px] bg-white/[0.05] backdrop-blur-sm ring-1 ring-white/10" />
                    <div className="absolute left-[31%] top-[60%] h-2 w-[28%] rounded-full bg-white/82" />
                    <div className="absolute left-[31%] top-[67%] h-2 w-[24%] rounded-full bg-white/24" />
                    <div className="absolute left-[31%] top-[74%] h-2 w-[34%] rounded-full bg-white/18" />
                    <div className="absolute left-1/2 top-[14%] h-[66%] w-[1px] -translate-x-1/2 bg-white/7" />
                </div>
            </div>
        </section>
    );
}

function StoryRail({ scenes }: { scenes: StoryScene[] }) {
    const railRef = useRef<HTMLDivElement | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const root = railRef.current;
        if (!root) return;

        const steps = Array.from(root.querySelectorAll('[data-story-step]')) as HTMLElement[];
        if (!steps.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visible) {
                    const target = visible.target as HTMLElement;
                    const nextIndex = Number(target.dataset.storyStep ?? 0);
                    if (!Number.isNaN(nextIndex)) {
                        setActiveIndex(nextIndex);
                    }
                }
            },
            {
                threshold: [0.35, 0.55, 0.75],
                rootMargin: '-18% 0px -18% 0px',
            }
        );

        steps.forEach((step) => observer.observe(step));
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={railRef} className="relative bg-[#f3ede2] text-slate-950 dark:bg-[#0f1013] dark:text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(228,218,201,0.8),transparent_22%),radial-gradient(circle_at_82%_68%,rgba(218,226,238,0.44),transparent_24%)] dark:bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.04),transparent_22%),radial-gradient(circle_at_82%_68%,rgba(255,255,255,0.03),transparent_24%)]" />

            <div className="relative mx-auto max-w-[1560px] gap-10 px-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:px-8">
                <div className="order-2 relative z-10">
                    {scenes.map((scene, index) => (
                        <article
                            key={scene.title}
                            id={`story-${index}`}
                            data-story-step={index}
                            className="flex min-h-[88svh] items-center py-18 lg:min-h-screen lg:py-0"
                        >
                            <div
                                className={`max-w-[31rem] transition-[opacity,transform,color] duration-700 ease-out ${activeIndex === index ? 'opacity-100 translate-y-0' : 'opacity-55 translate-y-8 lg:opacity-45'}`}
                            >
                                <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400 dark:text-slate-500">{scene.eyebrow}</p>
                                <h2 className="mt-6 text-[clamp(3.2rem,6vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.08em]">
                                    {scene.title}
                                </h2>
                                <p className="mt-6 text-[1.06rem] leading-8 text-slate-600 dark:text-slate-300">
                                    {scene.body}
                                </p>
                                <p className="mt-10 text-sm font-medium tracking-[-0.02em] text-slate-500 dark:text-slate-400">
                                    {scene.kicker}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="order-1 py-12 lg:sticky lg:top-24 lg:flex lg:h-[calc(100svh-6rem)] lg:items-center lg:py-0">
                    <StoryStage activeIndex={activeIndex} scene={scenes[activeIndex]} />
                </div>
            </div>
        </section>
    );
}

function StoryStage({ activeIndex, scene }: { activeIndex: number; scene: StoryScene }) {
    const palette = STAGE_PALETTES[activeIndex];

    return (
        <div className="landing-motion relative mx-auto h-[min(76vh,820px)] min-h-[480px] w-full max-w-[920px]" style={delayStyle(120)}>
            <div className={`absolute inset-[10%_4%_8%_8%] rounded-[60px] ring-1 transition-all duration-700 ${palette.shell}`} />
            <div className={`absolute left-[8%] top-[14%] h-[28%] w-[22%] rounded-full opacity-70 blur-[90px] transition-all duration-700 ${palette.accent}`} />
            <div className={`absolute right-[10%] top-[18%] rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.18em] transition-all duration-700 ${palette.badge}`}>
                {scene.eyebrow}
            </div>

            <OverviewStage active={activeIndex === 0} palette={palette} />
            <BudgetStage active={activeIndex === 1} palette={palette} />
            <ReviewStage active={activeIndex === 2} palette={palette} />

            <div className={`absolute bottom-[9%] left-[12%] flex items-center gap-3 text-[11px] font-medium tracking-[0.18em] transition-all duration-700 ${palette.caption}`}>
                <span>SCROLL</span>
                <div className="flex items-center gap-2">
                    {[0, 1, 2].map((item) => (
                        <span
                            key={item}
                            className={`block h-1.5 rounded-full transition-all duration-500 ${activeIndex === item ? 'w-7 bg-slate-950 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-white/26'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function OverviewStage({
    active,
    palette,
}: {
    active: boolean;
    palette: (typeof STAGE_PALETTES)[number];
}) {
    return (
        <div
            className={`absolute inset-[12%_8%_12%_10%] transition-[opacity,transform] duration-700 ease-out ${active ? 'opacity-100 translate-y-0 scale-100' : 'pointer-events-none opacity-0 translate-y-10 scale-[0.98]'}`}
        >
            <div className={`absolute left-[4%] top-[10%] h-[22%] w-[76%] rounded-[34px] transition-all duration-700 ${palette.surface}`} />
            <div className={`absolute left-[4%] top-[42%] h-[36%] w-[56%] rounded-[40px] transition-all duration-700 ${palette.surface}`} />
            <div className={`absolute right-[8%] top-[42%] h-[36%] w-[18%] rounded-[32px] transition-all duration-700 ${palette.surface}`} />
            <div className={`absolute left-[10%] top-[19%] h-2 w-[22%] rounded-full transition-all duration-700 ${palette.lineStrong}`} />
            <div className={`absolute left-[10%] top-[26%] h-2 w-[34%] rounded-full transition-all duration-700 ${palette.lineSoft}`} />
            <div className={`absolute left-[10%] top-[56%] h-2 w-[26%] rounded-full transition-all duration-700 ${palette.lineStrong}`} />
            <div className={`absolute left-[10%] top-[64%] h-2 w-[18%] rounded-full transition-all duration-700 ${palette.lineSoft}`} />
            <div className={`absolute left-[10%] top-[75%] h-3 w-[36%] rounded-full transition-all duration-700 ${palette.lineStrong}`} />
        </div>
    );
}

function BudgetStage({
    active,
    palette,
}: {
    active: boolean;
    palette: (typeof STAGE_PALETTES)[number];
}) {
    return (
        <div
            className={`absolute inset-[12%_8%_12%_10%] transition-[opacity,transform] duration-700 ease-out ${active ? 'opacity-100 translate-y-0 scale-100' : 'pointer-events-none opacity-0 translate-y-10 scale-[0.98]'}`}
        >
            <div className={`absolute left-[5%] top-[20%] h-[14%] w-[18%] rounded-[28px] transition-all duration-700 ${palette.surface}`} />
            <div className={`absolute right-[8%] top-[18%] h-[18%] w-[20%] rounded-[999px] transition-all duration-700 ${palette.surface}`} />
            <div className={`absolute left-[8%] bottom-[14%] h-[38%] w-[78%] rounded-[42px] transition-all duration-700 ${palette.surface}`} />
            <div className={`absolute left-[14%] bottom-[37%] h-2 w-[22%] rounded-full transition-all duration-700 ${palette.lineStrong}`} />
            <div className={`absolute left-[14%] bottom-[30%] h-2 w-[42%] rounded-full transition-all duration-700 ${palette.lineSoft}`} />
            <div className={`absolute left-[14%] bottom-[20%] h-3 w-[48%] rounded-full transition-all duration-700 ${palette.lineStrong}`} />
            <div className={`absolute left-[14%] bottom-[11%] h-3 w-[32%] rounded-full transition-all duration-700 ${palette.lineSoft}`} />
            <div className="absolute right-[14%] bottom-[21%] h-[16%] w-[18%] rounded-t-[38px] border-t border-l border-r border-white/16" />
        </div>
    );
}

function ReviewStage({
    active,
    palette,
}: {
    active: boolean;
    palette: (typeof STAGE_PALETTES)[number];
}) {
    return (
        <div
            className={`absolute inset-[12%_8%_12%_10%] transition-[opacity,transform] duration-700 ease-out ${active ? 'opacity-100 translate-y-0 scale-100' : 'pointer-events-none opacity-0 translate-y-10 scale-[0.98]'}`}
        >
            <div className={`absolute right-[11%] top-[12%] h-[58%] w-[48%] rotate-[3deg] rounded-[38px] transition-all duration-700 ${palette.surface}`} />
            <div className={`absolute left-[10%] top-[22%] h-[54%] w-[50%] -rotate-[4deg] rounded-[38px] transition-all duration-700 ${palette.surface}`} />
            <div className={`absolute left-[18%] top-[30%] h-2 w-[26%] rounded-full transition-all duration-700 ${palette.lineStrong}`} />
            <div className={`absolute left-[18%] top-[38%] h-2 w-[34%] rounded-full transition-all duration-700 ${palette.lineSoft}`} />
            <div className={`absolute left-[18%] top-[52%] h-2 w-[28%] rounded-full transition-all duration-700 ${palette.lineStrong}`} />
            <div className={`absolute left-[18%] top-[60%] h-2 w-[22%] rounded-full transition-all duration-700 ${palette.lineSoft}`} />
            <div className={`absolute right-[22%] top-[25%] h-2 w-[18%] rounded-full transition-all duration-700 ${palette.lineStrong}`} />
            <div className={`absolute right-[22%] top-[33%] h-2 w-[24%] rounded-full transition-all duration-700 ${palette.lineSoft}`} />
        </div>
    );
}

function FinalSection({ copy }: { copy: CopySchema['finale'] }) {
    return (
        <section className="relative min-h-[92svh] overflow-hidden bg-[#07080c] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_80%_76%,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,#06070b_0%,#0c0e13_100%)]" />

            <div className="relative mx-auto flex min-h-[92svh] max-w-[1560px] items-center px-5 py-20 sm:px-6 lg:px-8">
                <div className="landing-motion max-w-[64rem]" style={delayStyle(80)}>
                    <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">{copy.eyebrow}</p>
                    <h2 className="mt-6 max-w-[11ch] text-[clamp(3.4rem,7vw,6.7rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-white">
                        {copy.title}
                    </h2>
                    <p className="mt-7 max-w-[34rem] text-[1.06rem] leading-8 text-slate-300">
                        {copy.body}
                    </p>
                    <Link
                        to="/dashboard"
                        className="mt-12 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5"
                    >
                        {copy.cta}
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
