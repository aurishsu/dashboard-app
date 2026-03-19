import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartPie, LayoutDashboard, PiggyBank, ShieldCheck, WalletCards, X } from 'lucide-react';
import { useData } from '../context/useData';

const WELCOME_STORAGE_KEY = 'personal_ledger_welcome_seen_v2';

function shouldShowWelcome() {
    if (typeof window === 'undefined') return false;
    const hasSeenWelcome = window.localStorage.getItem(WELCOME_STORAGE_KEY);
    return !hasSeenWelcome;
}

export function WelcomeModal({
    openSignal = 0,
    onStartGuide,
    onRestoreBackup,
    hasBackupData,
}: {
    openSignal?: number;
    onStartGuide?: () => void;
    onRestoreBackup?: () => void;
    hasBackupData?: boolean;
}) {
    const navigate = useNavigate();
    const { accounts } = useData();
    const [open, setOpen] = useState(() => shouldShowWelcome() || openSignal > 0);

    const dismiss = () => {
        window.localStorage.setItem(WELCOME_STORAGE_KEY, '1');
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                dismiss();
            }
        };

        const html = document.documentElement;
        const body = document.body;
        const scrollContainer = document.querySelector<HTMLElement>('[data-app-scroll="true"]');

        const previousHtmlOverflow = html.style.overflow;
        const previousBodyOverflow = body.style.overflow;
        const previousBodyOverscroll = body.style.overscrollBehavior;
        const previousScrollOverflow = scrollContainer?.style.overflowY ?? '';

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.overscrollBehavior = 'none';
        if (scrollContainer) {
            scrollContainer.style.overflowY = 'hidden';
        }

        window.addEventListener('keydown', onKeyDown);
        return () => {
            html.style.overflow = previousHtmlOverflow;
            body.style.overflow = previousBodyOverflow;
            body.style.overscrollBehavior = previousBodyOverscroll;
            if (scrollContainer) {
                scrollContainer.style.overflowY = previousScrollOverflow;
            }
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const handleStart = () => {
        dismiss();
        navigate('/dashboard');
    };

    const handleGuide = () => {
        dismiss();
        onStartGuide?.();
    };

    const handleBudget = () => {
        dismiss();
        navigate('/budget');
    };

    const handleRestore = () => {
        dismiss();
        onRestoreBackup?.();
        navigate('/dashboard');
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onWheelCapture={event => event.stopPropagation()}
            onTouchMoveCapture={event => event.stopPropagation()}
        >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={dismiss} />

            <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-[1120px] overflow-y-auto overscroll-contain rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] dark:border-slate-700 dark:bg-slate-900">
                <button
                    type="button"
                    onClick={dismiss}
                    className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                    aria-label="关闭欢迎界面"
                >
                    <X size={15} />
                    关闭
                </button>

                <div className="grid gap-0 min-[1320px]:grid-cols-[minmax(0,1fr)_390px]">
                    <section className="relative flex overflow-hidden border-b border-slate-200 p-7 pr-18 dark:border-slate-800 min-[1320px]:border-b-0 min-[1320px]:border-r min-[1320px]:p-8 min-[1320px]:pr-20">
                        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-slate-100 blur-3xl dark:bg-slate-800" />

                        <div className="relative flex flex-1 flex-col">
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950">
                                <WalletCards size={14} />
                                首次使用
                            </div>

                            <h1 className="mt-6 max-w-2xl text-[2.15rem] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                                欢迎使用个人资产台账
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                                第一次打开时，不需要自己搭结构。系统已经放好了常用账户框架，你只要把数字改成真实情况，就能开始用了。
                            </p>

                            <div className="mt-6 rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.92)_0%,rgba(255,255,255,0.96)_100%)] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.78)_0%,rgba(15,23,42,0.54)_100%)]">
                                <div className="grid gap-2 md:grid-cols-3">
                                    <SignalTile
                                        icon={<ShieldCheck size={17} />}
                                        title="本地保存"
                                        body="不接银行，不上传服务器。"
                                    />
                                    <SignalTile
                                        icon={<LayoutDashboard size={17} />}
                                        title="先填数字"
                                        body="账户框架已经预先放好。"
                                    />
                                    <SignalTile
                                        icon={<PiggyBank size={17} />}
                                        title="预算能改"
                                        body="房租、生活费和转入都能改。"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">开始方式</p>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={handleGuide}
                                        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950 sm:col-span-2"
                                    >
                                        从空白模板开始
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStart}
                                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                                    >
                                        直接进入首页
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBudget}
                                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                                    >
                                        先看预算提醒
                                    </button>
                                    {hasBackupData && onRestoreBackup && (
                                        <button
                                            type="button"
                                            onClick={handleRestore}
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                                        >
                                            恢复之前的数据
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="rounded-[22px] border border-slate-200 bg-slate-50/90 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">开始前你只要记住</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <FlowPill label="不用新建结构" />
                                        <FlowPill label="不用补流水" />
                                        <FlowPill label="数字随时可改" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="relative overflow-hidden bg-[linear-gradient(180deg,#f6f8fc_0%,#eef3f9_100%)] p-7 dark:bg-[linear-gradient(180deg,#0d1522_0%,#0a111b_100%)] min-[1320px]:p-8">
                        <div className="absolute -right-16 -top-10 size-56 rounded-full bg-white/70 blur-3xl dark:bg-slate-700/15" />
                        <div className="absolute -bottom-12 -left-10 size-48 rounded-full bg-slate-200/70 blur-3xl dark:bg-slate-900/40" />

                        <div className="relative rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                <ChartPie size={13} />
                                上手预览
                            </div>

                            <h2 className="mt-4 text-[1.5rem] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                                三步完成第一版台账
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                这三步填完以后，你就会直接得到首页总览、预算结论和投资组合，不需要再做别的设置。
                            </p>

                            <div className="mt-5 rounded-[28px] border border-slate-900/10 bg-slate-950 p-4 text-white shadow-[0_20px_50px_rgba(15,23,42,0.28)] dark:border-white/8 dark:bg-[#09111c]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Setup Preview</p>
                                        <p className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-white">填完就能直接看到完整总览</p>
                                    </div>
                                    <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-200">
                                        Local First
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <PreviewRow
                                        icon={<WalletCards size={15} />}
                                        title="银行卡和钱包"
                                        note="先把常用账户余额改成真实数字"
                                        progress="先填这里"
                                        widthClass="w-[76%]"
                                    />
                                    <PreviewRow
                                        icon={<PiggyBank size={15} />}
                                        title="预算提醒"
                                        note="再填净收入、房租和生活费"
                                        progress="再看预算"
                                        widthClass="w-[58%]"
                                    />
                                    <PreviewRow
                                        icon={<LayoutDashboard size={15} />}
                                        title="首页与投资组合"
                                        note="最后检查总资产和结构是否顺手"
                                        progress="自动同步"
                                        widthClass="w-[88%]"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3 min-[1320px]:grid-cols-1">
                                <LandingStat value={`${accounts.length}`} label="预设账户" note="银行卡 · 钱包 · 券商" />
                                <LandingStat value="6" label="支持币种" note="AUD · CNY · USD · SGD · HKD · MYR" />
                                <LandingStat value="3" label="完成步骤" note="银行卡 -> 钱包 -> 预算提醒" />
                            </div>

                            <div className="mt-4 rounded-[22px] border border-slate-200/90 bg-slate-50/92 p-4 dark:border-slate-700/70 dark:bg-slate-950/78">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">开始顺序</p>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    <FlowPill label="银行卡" />
                                    <ArrowMarker />
                                    <FlowPill label="电子钱包" />
                                    <ArrowMarker />
                                    <FlowPill label="预算提醒" />
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function SignalTile({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
    return (
        <div className="rounded-[20px] bg-white/78 px-4 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 backdrop-blur-sm dark:bg-slate-950/42 dark:ring-slate-800/80">
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {icon}
                </div>
                <div>
                    <p className="text-[15px] font-semibold text-slate-950 dark:text-white">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-slate-500 dark:text-slate-400">{body}</p>
                </div>
            </div>
        </div>
    );
}

function LandingStat({ value, label, note }: { value: string; label: string; note: string }) {
    return (
        <div className="rounded-[20px] border border-slate-200 bg-slate-50/90 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-950/80">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2.5 text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
            <p className="mt-1.5 text-[13px] leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function PreviewRow({
    icon,
    title,
    note,
    progress,
    widthClass,
}: {
    icon: ReactNode;
    title: string;
    note: string;
    progress: string;
    widthClass: string;
}) {
    return (
        <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100">
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-[13px] leading-5 text-slate-300">{note}</p>
                    </div>
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

function FlowPill({ label }: { label: string }) {
    return (
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">{label}</span>
    );
}

function ArrowMarker() {
    return <span className="text-slate-400 dark:text-slate-500">→</span>;
}
