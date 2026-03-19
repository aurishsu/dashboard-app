import { ArrowRight, ChartColumnIncreasing, Globe, Landmark, Lock, PiggyBank, ShieldCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';

const HERO_PILLS = ['无需注册', '默认本地保存', '支持 6 种货币', '银行卡 / 钱包 / 券商统一总览'];

const FEATURE_CARDS = [
    {
        icon: <WalletCards size={18} />,
        title: '不用补流水，也能知道钱在哪',
        body: '你只维护当前余额，不用整理每一笔消费，照样能把分散账户放回同一张桌面里。',
    },
    {
        icon: <Globe size={18} />,
        title: '多币种放在同一个总览里看',
        body: 'AUD、CNY、USD、SGD、HKD、MYR 可以一起折算，立刻看出真实总资产和币种分布。',
    },
    {
        icon: <PiggyBank size={18} />,
        title: '预算提醒只盯最重要的几件事',
        body: '收入、房租、生活费和安全线都能直接判断，不需要先学一整套复杂预算系统。',
    },
    {
        icon: <Lock size={18} />,
        title: '默认留在你的浏览器里',
        body: '没有银行自动同步，也没有服务器账户库。这个版本先把隐私和可控感放在前面。',
    },
];

const HERO_SURFACES = [
    {
        label: '总资产总览',
        note: '一打开就能看到最大账户、当前焦点和多币种估值。',
    },
    {
        label: '预算提醒',
        note: '填完收入、房租和生活费，马上知道这个月的压力区间。',
    },
    {
        label: '报表与检查',
        note: '零余额账户、覆盖币种和导出入口都放在一起，复核更快。',
    },
];

const STARTER_STEPS = [
    {
        step: '01',
        title: '把常用账户余额改成真实数字',
        body: '先从银行卡、电子钱包和券商开始，不需要重建结构，也不用先分类流水。',
    },
    {
        step: '02',
        title: '补上预算提醒里的关键数据',
        body: '净收入、房租、生活费和安全线这几个数字填完，就能得到当月判断。',
    },
    {
        step: '03',
        title: '回到总览和报表复核一遍',
        body: '最后看一下总资产、币种分布和账户结构，确认这一版是不是顺手。',
    },
];

const FIT_POINTS = [
    '想知道自己一共有多少钱，但不想维护完整流水的人',
    '银行卡、钱包和券商并存，需要一个统一总览的人',
    '经常在多币种之间切换，想快速看到真实资产结构的人',
];

export function PublicHome() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_26%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.16),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#edf3fb_48%,#ffffff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_28%),radial-gradient(circle_at_top_right,rgba(71,85,105,0.26),transparent_28%),linear-gradient(180deg,#09111b_0%,#0b1420_44%,#101826_100%)] dark:text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-5 pb-14 pt-5 sm:px-6 lg:px-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/82 px-5 py-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/74">
                    <div className="flex items-center gap-4">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.14)] dark:bg-white dark:text-slate-950">
                            <Landmark size={20} />
                        </div>
                        <div>
                            <p className="text-base font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Harbor Ledger</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">轻量、清楚、本地优先的个人资产总览</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/reports"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                        >
                            查看报表页
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                        >
                            打开网页版
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </header>

                <main className="mt-8 space-y-8">
                    <section className="grid gap-6 min-[1340px]:grid-cols-[minmax(0,1.12fr)_430px]">
                        <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/84 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/74 sm:p-9">
                            <div className="absolute -left-18 top-0 size-64 rounded-full bg-slate-200/70 blur-3xl dark:bg-slate-800/30" />
                            <div className="absolute right-0 top-0 h-56 w-64 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_65%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_65%)]" />

                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-1.5 text-[11px] font-medium tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">
                                    <ShieldCheck size={14} />
                                    本地优先
                                </div>

                                <p className="mt-6 max-w-[44rem] text-[11px] font-medium tracking-[0.16em] text-slate-400 dark:text-slate-500">
                                    更轻的个人资产工作台
                                </p>

                                <h1 className="mt-4 max-w-[11ch] [text-wrap:balance] text-[clamp(2.9rem,4.6vw,4.15rem)] font-medium leading-[1.08] tracking-[-0.06em] text-slate-950 dark:text-white">
                                    一眼看清你的总资产
                                </h1>

                                <p className="mt-4 max-w-[32rem] text-[1.28rem] leading-8 tracking-[-0.03em] text-slate-700 dark:text-slate-200">
                                    不记流水，也能知道钱在哪。
                                </p>

                                <p className="mt-5 max-w-[38rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300">
                                    Harbor Ledger 把分散在银行卡、钱包和券商里的余额，重新整理成一个清楚的总览。
                                    你维护的是当前状态，不是一整本复杂账本。
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {HERO_PILLS.map(label => (
                                        <InfoPill key={label} label={label} />
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_18px_34px_rgba(15,23,42,0.16)] transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                                    >
                                        立即打开工作台
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        to="/budget"
                                        className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                                    >
                                        先看预算提醒
                                    </Link>
                                </div>

                                <div className="mt-9 grid gap-4 md:grid-cols-3">
                                    {HERO_SURFACES.map(surface => (
                                        <div
                                            key={surface.label}
                                            className="rounded-[24px] border border-slate-200 bg-slate-50/88 px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900/72"
                                        >
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                                                直接看到
                                            </p>
                                            <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{surface.label}</p>
                                            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{surface.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <aside className="rounded-[36px] border border-slate-200 bg-[linear-gradient(180deg,#101726_0%,#0a1020_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] dark:border-slate-700 sm:p-7">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-slate-200">
                                <ChartColumnIncreasing size={13} />
                                打开就看到
                            </div>

                            <h2 className="mt-4 max-w-[13ch] text-[1.95rem] font-medium leading-[1.18] tracking-[-0.05em] text-white">
                                总览、预算和报表，
                                <br />
                                一打开就都在
                            </h2>

                            <div className="mt-6 space-y-3">
                                <PreviewPanel
                                    title="总资产总览"
                                    body="多币种折算、最大账户和当前焦点"
                                    progress="一打开就有"
                                    widthClass="w-[84%]"
                                />
                                <PreviewPanel
                                    title="预算提醒"
                                    body="收入、房租、生活费和安全线"
                                    progress="填完就判断"
                                    widthClass="w-[62%]"
                                />
                                <PreviewPanel
                                    title="报表复核"
                                    body="零余额账户、覆盖币种和导出入口"
                                    progress="适合检查"
                                    widthClass="w-[76%]"
                                />
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3 min-[1340px]:grid-cols-1">
                                <MetricTile value="6" label="支持币种" note="AUD / CNY / USD / SGD / HKD / MYR" />
                                <MetricTile value="0" label="云端账号" note="当前版本默认不上传个人资产" />
                                <MetricTile value="3" label="核心页面" note="总览、预算、报表直接可用" />
                            </div>
                        </aside>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
                        {FEATURE_CARDS.map(card => (
                            <div
                                key={card.title}
                                className="rounded-[28px] border border-white/70 bg-white/84 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/72"
                            >
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                                    {card.icon}
                                </div>
                                <h3 className="mt-5 text-[1.15rem] font-medium tracking-[-0.03em] text-slate-950 dark:text-white">{card.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{card.body}</p>
                            </div>
                        ))}
                    </section>

                    <section className="grid gap-6 min-[1120px]:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="rounded-[34px] border border-white/70 bg-white/84 p-7 shadow-[0_20px_48px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/72 sm:p-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                <WalletCards size={14} />
                                快速开始
                            </div>

                            <h2 className="mt-5 text-[1.9rem] font-medium tracking-[-0.05em] text-slate-950 dark:text-white">
                                第一次用，三步就够
                            </h2>
                            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-300">
                                这个版本不要求你先建体系，也不要求你先补历史数据。
                                先把眼前最重要的余额和预算填进去，马上就能得到可用的总览。
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                {STARTER_STEPS.map(step => (
                                    <RoadmapStep key={step.step} step={step.step} title={step.title} body={step.body} />
                                ))}
                            </div>
                        </div>

                        <aside className="rounded-[34px] border border-slate-200 bg-white/86 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/74">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">适合这样的人</p>
                            <div className="mt-4 space-y-3">
                                {FIT_POINTS.map(point => (
                                    <div
                                        key={point}
                                        className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                    >
                                        {point}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-[26px] bg-slate-950 px-5 py-5 text-white dark:bg-white dark:text-slate-950">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 dark:text-slate-500">现在就能用</p>
                                <p className="mt-3 text-[1.65rem] font-medium tracking-[-0.04em]">直接进网页版开始维护</p>
                                <p className="mt-3 text-sm leading-7 text-slate-300 dark:text-slate-600">
                                    不需要注册，也不会再看到试用倒计时或假的充值入口。你现在打开的就是可用版本。
                                </p>
                                <Link
                                    to="/dashboard"
                                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 dark:bg-slate-950 dark:text-white"
                                >
                                    打开工作台
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
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {label}
        </div>
    );
}

function MetricTile({ value, label, note }: { value: string; label: string; note: string }) {
    return (
        <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">{label}</p>
            <p className="mt-2.5 text-[1.85rem] font-medium tracking-[-0.04em] text-white">{value}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-300">{note}</p>
        </div>
    );
}

function PreviewPanel({
    title,
    body,
    progress,
    widthClass,
}: {
    title: string;
    body: string;
    progress: string;
    widthClass: string;
}) {
    return (
        <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
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

function RoadmapStep({ step, title, body }: { step: string; title: string; body: string }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-5 py-5 dark:border-slate-800 dark:bg-slate-900/72">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{step}</p>
            <p className="mt-3 text-lg font-medium tracking-[-0.03em] text-slate-950 dark:text-white">{title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{body}</p>
        </div>
    );
}
