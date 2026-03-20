import { type CSSProperties, useEffect, useState } from 'react';
import { ArrowRight, Languages, Landmark, MoonStar, SunMedium } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';

type StoryScene = {
    eyebrow: string;
    title: string;
    body: string;
    note: string;
    next: string;
    mode: 'light' | 'dark';
    align: 'left' | 'right';
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
            open: '开始设置',
            themeLabel: '切换明暗主题',
            localeZh: '中文',
            localeEn: 'EN',
        },
        hero: {
            eyebrow: 'Harbor Ledger',
            title: '把你的钱看成一个整体',
            subtitle: '不是记账，不是流水，而是一张更清楚的资产桌面。',
            body: '银行卡、电子钱包和券商里的当前余额，应该回到同一张视图里。先看见，再判断，再决定把哪些截图交给识别流程。',
            primary: '开始设置',
            secondary: '继续往下',
        },
        scenes: [
            {
                eyebrow: '01 总览',
                title: '先看到全部，再看到重点。',
                body: '最大账户、多币种估值和当前焦点，应该同时出现，而不是散在不同入口里来回寻找。',
                note: '一张屏先把全局讲清楚。',
                next: '下一屏',
                mode: 'light',
                align: 'right',
                visual: 'overview',
            },
            {
                eyebrow: '02 预算',
                title: '知道这个月，还稳不稳。',
                body: '把收入、房租、生活费和安全线放进去，月度压力应该立刻有答案，不该像填表一样费力。',
                note: '信号越直接，页面越让人安心。',
                next: '下一屏',
                mode: 'dark',
                align: 'left',
                visual: 'budget',
            },
            {
                eyebrow: '03 复核',
                title: '最后再检查，但一眼就能收尾。',
                body: '零余额账户、币种覆盖和导出入口，应该像顺手整理，而不是用完前的最后一道门槛。',
                note: '收尾越轻，越愿意反复打开。',
                next: '最后一屏',
                mode: 'light',
                align: 'right',
                visual: 'review',
            },
        ],
        finale: {
            eyebrow: 'Harbor Ledger',
            title: '先看清楚，再决定下一步。',
            body: '先走一遍设置向导，把入口、截图队列和零值桌面定下来，再把真实余额放回同一张桌面里。',
            cta: '进入设置',
        },
    },
    en: {
        header: {
            open: 'Start setup',
            themeLabel: 'Toggle light and dark theme',
            localeZh: '中文',
            localeEn: 'EN',
        },
        hero: {
            eyebrow: 'Harbor Ledger',
            title: 'See your money as one whole.',
            subtitle: 'Not bookkeeping. Not transactions. A clearer surface for your assets.',
            body: 'The balances in your cards, wallets, and broker accounts should return to one surface. See first. Judge after. Then decide which screenshots should enter recognition.',
            primary: 'Start setup',
            secondary: 'Keep scrolling',
        },
        scenes: [
            {
                eyebrow: '01 Overview',
                title: 'See the whole picture before the details.',
                body: 'Your largest holding, FX-adjusted value, and current focus should appear together instead of hiding behind multiple entry points.',
                note: 'The first screen should settle the whole picture.',
                next: 'Next screen',
                mode: 'light',
                align: 'right',
                visual: 'overview',
            },
            {
                eyebrow: '02 Budget',
                title: 'Know whether this month still feels steady.',
                body: 'Income, rent, living costs, and your safety line should turn into an answer right away instead of becoming another form.',
                note: 'The faster the signal, the calmer the page feels.',
                next: 'Next screen',
                mode: 'dark',
                align: 'left',
                visual: 'budget',
            },
            {
                eyebrow: '03 Review',
                title: 'Leave checking for the end, but make it immediate.',
                body: 'Zero-balance accounts, currency coverage, and export should feel like a clean finishing pass, not another barrier on the way out.',
                note: 'A lighter finish makes the product easier to reopen.',
                next: 'Final screen',
                mode: 'light',
                align: 'right',
                visual: 'review',
            },
        ],
        finale: {
            eyebrow: 'Harbor Ledger',
            title: 'See clearly first. Decide the rest after.',
            body: 'Go through setup first, shape the intake lane, and confirm the zero-state workspace before any real balances land.',
            cta: 'Enter setup',
        },
    },
};

function delayStyle(ms: number): CSSProperties {
    return { '--enter-delay': `${ms}ms` } as CSSProperties;
}

function heroTitleClass(language: SiteLanguage) {
    return language === 'zh'
        ? 'landing-title-zh text-[clamp(3.5rem,6.5vw,6.4rem)] leading-[0.98] tracking-[-0.045em] lg:whitespace-nowrap'
        : 'landing-title-en mx-auto max-w-[13ch] text-[clamp(3rem,5.2vw,5.5rem)] leading-[0.98] tracking-[-0.055em]';
}

function sceneTitleClass(language: SiteLanguage) {
    return language === 'zh'
        ? 'landing-title-zh max-w-[10.6ch] text-[clamp(2.8rem,4.7vw,4.9rem)] leading-[1.02] tracking-[-0.042em]'
        : 'landing-title-en max-w-[13.2ch] text-[clamp(2.5rem,4vw,4.2rem)] leading-[1.02] tracking-[-0.045em]';
}

function finaleTitleClass(language: SiteLanguage) {
    return language === 'zh'
        ? 'landing-title-zh max-w-[10ch] text-[clamp(3rem,5.4vw,5.4rem)] leading-[1.02] tracking-[-0.045em]'
        : 'landing-title-en max-w-[12ch] text-[clamp(2.8rem,4.8vw,5rem)] leading-[1] tracking-[-0.05em]';
}

export function PublicHome() {
    const { isDark, toggleTheme } = useTheme();
    const [language, setLanguage] = useState<SiteLanguage>(() => loadSiteLanguage());
    const copy = COPY[language];

    useEffect(() => {
        saveSiteLanguage(language);
    }, [language]);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('landing-scroll-snap');

        return () => {
            root.classList.remove('landing-scroll-snap');
        };
    }, []);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f2ecdf] text-slate-950 dark:bg-[#0e1014] dark:text-white">
            <header className="fixed inset-x-0 top-0 z-50">
                <div className="mx-auto flex max-w-[1580px] items-center justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/88 px-4 py-3 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-[#15171b]/86">
                        <div className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Landmark size={17} />
                        </div>
                        <p className="text-[1.02rem] font-semibold tracking-[-0.035em]">Harbor Ledger</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/88 px-2.5 py-2 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-[#15171b]/86">
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
                            to="/setup"
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
                {copy.scenes.map((scene, index) => (
                    <StorySection
                        key={scene.eyebrow}
                        index={index}
                        scene={scene}
                        language={language}
                        nextHref={index < copy.scenes.length - 1 ? `#scene-${index + 1}` : '#finale'}
                        delay={100 + index * 60}
                        id={`scene-${index}`}
                    />
                ))}
                <FinalSection copy={copy.finale} language={language} />
            </main>
        </div>
    );
}

function HeroSection({ copy, language }: { copy: CopySchema['hero']; language: SiteLanguage }) {
    return (
        <section className="landing-section relative flex min-h-[100svh] items-center overflow-hidden bg-[#06070b] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_18%_78%,rgba(89,102,129,0.18),transparent_22%),radial-gradient(circle_at_82%_72%,rgba(89,102,129,0.14),transparent_24%),linear-gradient(180deg,#05060a_0%,#0a0c10_100%)]" />
            <div className="absolute left-1/2 top-[24%] h-[34vw] w-[34vw] -translate-x-1/2 rounded-full bg-white/8 blur-[140px]" />

            <div className="relative mx-auto flex min-h-[100svh] max-w-[1580px] flex-col items-center justify-center px-5 pb-16 pt-28 text-center sm:px-6 lg:px-8">
                <div className="landing-motion max-w-[76rem]" style={delayStyle(80)}>
                    <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">{copy.eyebrow}</p>
                    <h1 className={`mt-8 ${heroTitleClass(language)}`}>
                        {copy.title}
                    </h1>
                    <p className={`mx-auto mt-7 max-w-[24ch] text-balance ${language === 'zh' ? 'text-[clamp(1.45rem,1.9vw,1.85rem)] leading-[1.5] tracking-[-0.02em]' : 'text-[clamp(1.28rem,1.7vw,1.7rem)] leading-[1.46] tracking-[-0.018em]'} text-slate-200`}>
                        {copy.subtitle}
                    </p>
                    <p className="mx-auto mt-6 max-w-[38rem] text-[1rem] leading-8 text-slate-400">
                        {copy.body}
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/setup"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5"
                        >
                            {copy.primary}
                            <ArrowRight size={15} />
                        </Link>
                        <a
                            href="#scene-0"
                            className="inline-flex items-center rounded-full border border-white/12 px-6 py-3.5 text-sm font-medium text-slate-200 transition hover:border-white/24 hover:text-white"
                        >
                            {copy.secondary}
                        </a>
                    </div>
                </div>

                <div className="landing-motion relative mt-16 h-[34vw] max-h-[420px] min-h-[220px] w-full max-w-[1060px]" style={delayStyle(180)}>
                    <div className="landing-drift absolute left-1/2 top-[8%] h-[82%] w-[80%] -translate-x-1/2 rounded-[56px] bg-[linear-gradient(160deg,#1b1e26_0%,#0a0c10_100%)] shadow-[0_60px_160px_rgba(0,0,0,0.42)] ring-1 ring-white/8" />
                    <div className="landing-drift absolute left-[20%] top-[18%] h-[22%] w-[30%] rounded-[32px] bg-white/[0.05] backdrop-blur-sm ring-1 ring-white/10" style={{ animationDelay: '1.2s' }} />
                    <div className="landing-drift absolute right-[18%] top-[28%] h-[42%] w-[26%] rounded-[36px] bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/8" style={{ animationDelay: '2.1s' }} />
                    <div className="absolute left-[24%] top-[27%] h-2 w-[16%] rounded-full bg-white/84" />
                    <div className="absolute left-[24%] top-[34%] h-2 w-[11%] rounded-full bg-white/28" />
                    <div className="absolute left-[28%] top-[58%] h-[24%] w-[42%] rounded-[34px] bg-white/[0.05] backdrop-blur-sm ring-1 ring-white/10" />
                    <div className="absolute left-[33%] top-[66%] h-2 w-[24%] rounded-full bg-white/82" />
                    <div className="absolute left-[33%] top-[73%] h-2 w-[20%] rounded-full bg-white/24" />
                </div>
            </div>
        </section>
    );
}

function StorySection({
    id,
    index,
    scene,
    language,
    nextHref,
    delay,
}: {
    id: string;
    index: number;
    scene: StoryScene;
    language: SiteLanguage;
    nextHref: string;
    delay: number;
}) {
    const light = scene.mode === 'light';
    const reverse = scene.align === 'right';

    return (
        <section
            id={id}
            className={`landing-section relative overflow-hidden lg:h-[100svh] lg:min-h-[100svh] ${light ? 'bg-[#f2ecdf] text-slate-950' : 'bg-[#0d1015] text-white'}`}
        >
            <div
                className={`absolute inset-0 ${light
                    ? 'bg-[radial-gradient(circle_at_18%_24%,rgba(228,218,201,0.76),transparent_22%),radial-gradient(circle_at_82%_68%,rgba(218,226,238,0.44),transparent_24%)]'
                    : 'bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.05),transparent_22%),radial-gradient(circle_at_82%_68%,rgba(255,255,255,0.03),transparent_24%)]'}`}
            />
            <div className={`pointer-events-none absolute ${reverse ? 'left-[5%]' : 'right-[5%]'} top-1/2 hidden -translate-y-1/2 text-[min(24vw,20rem)] font-semibold leading-none tracking-[-0.08em] lg:block ${light ? 'text-slate-900/[0.035]' : 'text-white/[0.045]'}`}>
                0{index + 1}
            </div>

            <div className={`relative mx-auto grid max-w-[1580px] items-center gap-16 px-5 py-24 sm:px-6 lg:h-full lg:px-8 ${reverse ? 'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]' : 'lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]'}`}>
                <div className={reverse ? 'lg:order-2' : ''}>
                    <div className="landing-motion max-w-[42rem]" style={delayStyle(delay)}>
                        <p className={`text-[11px] font-medium tracking-[0.22em] ${light ? 'text-slate-400' : 'text-slate-500'}`}>{scene.eyebrow}</p>
                        <h2 className={`mt-6 ${sceneTitleClass(language)}`}>
                            {scene.title}
                        </h2>
                        <p className={`mt-7 max-w-[34rem] text-[1.02rem] leading-8 ${light ? 'text-slate-600' : 'text-slate-300'}`}>
                            {scene.body}
                        </p>
                        <p className={`mt-10 text-sm font-medium tracking-[-0.02em] ${light ? 'text-slate-500' : 'text-slate-400'}`}>
                            {scene.note}
                        </p>
                        <a
                            href={nextHref}
                            className={`mt-10 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 ${light ? 'border-slate-300/90 bg-white/70 text-slate-700 hover:border-slate-400 hover:bg-white' : 'border-white/14 bg-white/[0.04] text-slate-200 hover:border-white/26 hover:text-white'}`}
                        >
                            {scene.next}
                            <ArrowRight size={14} />
                        </a>
                    </div>
                </div>

                <div className={reverse ? 'lg:order-1' : ''}>
                    <StoryVisual variant={scene.visual} light={light} delay={delay + 80} />
                </div>
            </div>
        </section>
    );
}

function StoryVisual({
    variant,
    light,
    delay,
}: {
    variant: StoryScene['visual'];
    light: boolean;
    delay: number;
}) {
    const shell = light
        ? 'bg-[linear-gradient(160deg,#fbf8f1_0%,#efe7d8_100%)] ring-black/6 shadow-[0_38px_100px_rgba(15,23,42,0.12)]'
        : 'bg-[linear-gradient(160deg,#12161d_0%,#0b0e13_100%)] ring-white/8 shadow-[0_44px_120px_rgba(0,0,0,0.36)]';
    const surface = light
        ? 'bg-white/90 shadow-[0_22px_60px_rgba(15,23,42,0.08)]'
        : 'bg-white/6 ring-1 ring-white/10 shadow-[0_22px_60px_rgba(0,0,0,0.18)]';
    const strong = light ? 'bg-slate-950' : 'bg-white';
    const soft = light ? 'bg-slate-300' : 'bg-white/28';

    return (
        <div className="landing-motion relative mx-auto h-[min(72vh,760px)] min-h-[420px] w-full max-w-[760px]" style={delayStyle(delay)}>
            <div className={`absolute inset-0 rounded-[58px] ring-1 transition-all duration-700 ${shell}`} />
            <div className={`absolute left-[8%] top-[10%] h-[24%] w-[24%] rounded-full blur-[70px] ${light ? 'bg-[#dbe4ef]' : 'bg-[#262d39]'}`} />
            {variant === 'overview' ? (
                <>
                    <div className={`absolute left-[10%] top-[13%] h-[24%] w-[60%] rounded-[34px] ${surface}`} />
                    <div className={`absolute left-[10%] top-[46%] h-[34%] w-[46%] rounded-[38px] ${surface}`} />
                    <div className={`absolute right-[12%] top-[46%] h-[34%] w-[16%] rounded-[30px] ${surface}`} />
                    <div className={`absolute left-[15%] top-[23%] h-2 w-[20%] rounded-full ${strong}`} />
                    <div className={`absolute left-[15%] top-[31%] h-2 w-[30%] rounded-full ${soft}`} />
                    <div className={`absolute left-[15%] top-[61%] h-2 w-[22%] rounded-full ${strong}`} />
                    <div className={`absolute left-[15%] top-[69%] h-2 w-[14%] rounded-full ${soft}`} />
                    <div className={`absolute left-[15%] top-[80%] h-3 w-[28%] rounded-full ${strong}`} />
                </>
            ) : null}

            {variant === 'budget' ? (
                <>
                    <div className={`absolute left-[11%] top-[16%] h-[18%] w-[22%] rounded-[32px] ${surface}`} />
                    <div className={`absolute right-[10%] top-[18%] h-[18%] w-[20%] rounded-full ${surface}`} />
                    <div className={`absolute left-[10%] bottom-[14%] h-[42%] w-[80%] rounded-[40px] ${surface}`} />
                    <svg viewBox="0 0 800 600" className="absolute inset-[8%] h-[84%] w-[84%]">
                        <path
                            d="M92 410 C 180 378, 262 430, 362 310 S 540 182, 690 142"
                            fill="none"
                            stroke={light ? '#0f172a' : '#ffffff'}
                            strokeOpacity={light ? '0.95' : '0.88'}
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M92 410 C 180 378, 262 430, 362 310 S 540 182, 690 142"
                            fill="none"
                            stroke={light ? '#cbd5e1' : 'rgba(255,255,255,0.24)'}
                            strokeWidth="28"
                            strokeLinecap="round"
                            strokeOpacity="0.28"
                        />
                    </svg>
                    <div className={`absolute left-[18%] bottom-[27%] h-2 w-[26%] rounded-full ${strong}`} />
                    <div className={`absolute left-[18%] bottom-[19%] h-2 w-[18%] rounded-full ${soft}`} />
                </>
            ) : null}

            {variant === 'review' ? (
                <>
                    <div className={`absolute right-[12%] top-[14%] h-[54%] w-[44%] rotate-[4deg] rounded-[38px] ${surface}`} />
                    <div className={`absolute left-[14%] top-[24%] h-[54%] w-[46%] -rotate-[5deg] rounded-[38px] ${surface}`} />
                    <div className={`absolute left-[22%] top-[34%] h-2 w-[24%] rounded-full ${strong}`} />
                    <div className={`absolute left-[22%] top-[42%] h-2 w-[34%] rounded-full ${soft}`} />
                    <div className={`absolute left-[22%] top-[56%] h-2 w-[28%] rounded-full ${strong}`} />
                    <div className={`absolute left-[22%] top-[64%] h-2 w-[22%] rounded-full ${soft}`} />
                    <div className={`absolute right-[20%] top-[28%] h-2 w-[16%] rounded-full ${strong}`} />
                    <div className={`absolute right-[20%] top-[36%] h-2 w-[22%] rounded-full ${soft}`} />
                </>
            ) : null}

            <div className={`absolute bottom-[7%] left-[10%] rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] ${light ? 'border-black/8 bg-white/70 text-slate-500' : 'border-white/12 bg-white/6 text-slate-400'}`}>
                {variant === 'overview' ? '01' : variant === 'budget' ? '02' : '03'}
            </div>
        </div>
    );
}

function FinalSection({ copy, language }: { copy: CopySchema['finale']; language: SiteLanguage }) {
    return (
        <section id="finale" className="landing-section relative flex min-h-[100svh] items-center overflow-hidden bg-[#07080c] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_80%_76%,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,#06070b_0%,#0c0e13_100%)]" />

            <div className="relative mx-auto flex min-h-[100svh] max-w-[1580px] items-center px-5 py-24 sm:px-6 lg:px-8">
                <div className="landing-motion max-w-[66rem]" style={delayStyle(100)}>
                    <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">{copy.eyebrow}</p>
                    <h2 className={`mt-6 ${finaleTitleClass(language)}`}>
                        {copy.title}
                    </h2>
                    <p className="mt-7 max-w-[36rem] text-[1.04rem] leading-8 text-slate-300">
                        {copy.body}
                    </p>
                    <Link
                        to="/setup"
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
