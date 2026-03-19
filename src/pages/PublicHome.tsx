import { ArrowRight, ChartColumnIncreasing, Globe, Landmark, Lock, PiggyBank, ShieldCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURE_CARDS = [
    {
        icon: <WalletCards size={18} />,
        title: '只维护余额，不做复杂记账',
        body: '你不需要导流水、不需要分类交易，打开后只改当前余额和币种就行。',
    },
    {
        icon: <Globe size={18} />,
        title: '多币种直接看总资产',
        body: 'AUD、CNY、USD、SGD、HKD、MYR 可以放在同一个工作台里比较。',
    },
    {
        icon: <PiggyBank size={18} />,
        title: '预算提醒只回答核心问题',
        body: '这个月的钱够不够房租和生活费，一眼就能看明白，不逼你做重度预算。',
    },
    {
        icon: <Lock size={18} />,
        title: '默认本地保存',
        body: '没有银行同步，没有服务端账户库，数据默认只留在你自己的浏览器里。',
    },
];

const QUICK_POINTS = [
    '适合留学生做资产总览',
    '适合银行卡、钱包、券商混合管理',
    '适合先上网页 Beta，再慢慢打磨 iPad 和 App Store',
];

export function PublicHome() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_28%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_26%),linear-gradient(180deg,#f7f9fd_0%,#eff4fb_48%,#ffffff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_28%),radial-gradient(circle_at_top_right,rgba(51,65,85,0.32),transparent_26%),linear-gradient(180deg,#09111b_0%,#0b1420_48%,#101826_100%)] dark:text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-5 pb-12 pt-5 sm:px-6 lg:px-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/72">
                    <div className="flex items-center gap-4">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] dark:bg-white dark:text-slate-950">
                            <Landmark size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-[-0.03em] text-slate-950 dark:text-white">Harbor Ledger</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">本地优先的个人资产台账</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/budget"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                        >
                            先看预算提醒
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                        >
                            进入网页版
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </header>

                <main className="mt-8 space-y-8">
                    <section className="grid gap-6 min-[1180px]:grid-cols-[minmax(0,1.08fr)_420px]">
                        <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/82 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/74 sm:p-8">
                            <div className="absolute -left-16 top-0 size-56 rounded-full bg-slate-200/70 blur-3xl dark:bg-slate-800/40" />
                            <div className="absolute right-0 top-0 h-48 w-64 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.12),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_62%)]" />

                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950">
                                    <ShieldCheck size={14} />
                                    Web Beta
                                </div>

                                <h1 className="mt-6 max-w-4xl text-[clamp(2.7rem,6vw,5rem)] font-black leading-[0.94] tracking-[-0.08em] text-slate-950 dark:text-white">
                                    给不想记流水的人做的
                                    <br />
                                    资产工作台
                                </h1>

                                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
                                    Harbor Ledger 不试图替你做自动同步，也不逼你维护一整套复杂账本。
                                    它只解决最核心的三个问题: 你现在一共有多少钱，钱分散在哪些账户里，以及这个月的现金流够不够稳。
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <InfoPill label="本地优先" />
                                    <InfoPill label="6 个币种" />
                                    <InfoPill label="银行卡 / 钱包 / 券商" />
                                    <InfoPill label="网页先行，持续打磨 iPad" />
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)] transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                                    >
                                        立即打开台账
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        to="/reports"
                                        className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                                    >
                                        先看报表与检查
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <aside className="rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#101726_0%,#0a1020_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] dark:border-slate-700">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                                <ChartColumnIncreasing size={13} />
                                Product Snapshot
                            </div>

                            <h2 className="mt-4 text-[1.8rem] font-black tracking-[-0.05em] text-white">
                                先知道钱在哪，再决定要不要折腾更复杂的工具
                            </h2>

                            <div className="mt-6 space-y-3">
                                <PreviewPanel
                                    title="资产总览"
                                    body="多币种折算、最大账户、当前焦点"
                                    progress="打开就能看"
                                    widthClass="w-[84%]"
                                />
                                <PreviewPanel
                                    title="预算提醒"
                                    body="净收入、房租、生活费和安全线"
                                    progress="填完就判断"
                                    widthClass="w-[62%]"
                                />
                                <PreviewPanel
                                    title="报表与检查"
                                    body="零余额账户、多币种覆盖和导出"
                                    progress="适合复核"
                                    widthClass="w-[76%]"
                                />
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3 min-[1180px]:grid-cols-1">
                                <MetricTile value="6" label="支持币种" note="AUD / CNY / USD / SGD / HKD / MYR" />
                                <MetricTile value="0" label="服务器账户库" note="默认不上传个人资产数据" />
                                <MetricTile value="3" label="核心页面" note="总览、预算、报表都能直接打开" />
                            </div>
                        </aside>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
                        {FEATURE_CARDS.map(card => (
                            <div key={card.title} className="rounded-[28px] border border-white/70 bg-white/82 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/72">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                                    {card.icon}
                                </div>
                                <h3 className="mt-5 text-xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">{card.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{card.body}</p>
                            </div>
                        ))}
                    </section>

                    <section className="grid gap-6 min-[1100px]:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="rounded-[32px] border border-white/70 bg-white/82 p-7 shadow-[0_20px_48px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/72 sm:p-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                <Globe size={14} />
                                为什么先做网页
                            </div>
                            <h2 className="mt-5 text-[2rem] font-black tracking-[-0.06em] text-slate-950 dark:text-white">
                                先把体验打磨顺，再决定怎么卖
                            </h2>
                            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-300">
                                现在最重要的不是赶着上 App Store，而是让网页端先变成一个别人愿意持续打开的产品。
                                所以当前版本先把总览、预算和报表做好，再逐步补会员、云同步和更细的设备适配。
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <RoadmapStep step="01" title="先上网页 Beta" body="先给真实用户看，收反馈，确认最核心的页面是不是顺手。" />
                                <RoadmapStep step="02" title="再做会员体系" body="等产品定位稳定，再接真正的付费和权限逻辑，不制造假充值按钮。" />
                                <RoadmapStep step="03" title="最后打磨原生端" body="把 iPad 和 App Store 作为下一阶段，而不是现在的唯一起点。" />
                            </div>
                        </div>

                        <aside className="rounded-[32px] border border-slate-200 bg-white/86 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/74">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">适合谁</p>
                            <div className="mt-4 space-y-3">
                                {QUICK_POINTS.map(point => (
                                    <div key={point} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                        {point}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-[24px] bg-slate-950 px-5 py-5 text-white dark:bg-white dark:text-slate-950">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 dark:text-slate-500">当前状态</p>
                                <p className="mt-3 text-2xl font-black tracking-[-0.04em]">网页版已上线</p>
                                <p className="mt-3 text-sm leading-7 text-slate-300 dark:text-slate-600">
                                    你现在就可以直接进入网页版试用，不需要注册，也不会看到假装已经接好支付的占位页。
                                </p>
                                <Link
                                    to="/dashboard"
                                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:opacity-90 dark:bg-slate-950 dark:text-white"
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
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {label}
        </div>
    );
}

function MetricTile({ value, label, note }: { value: string; label: string; note: string }) {
    return (
        <div className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">{label}</p>
            <p className="mt-2.5 text-[1.9rem] font-black tracking-[-0.05em] text-white">{value}</p>
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
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="mt-1 text-[13px] leading-5 text-slate-300">{body}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold text-slate-200">
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
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{step}</p>
            <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{body}</p>
        </div>
    );
}
