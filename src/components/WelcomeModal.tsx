import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartPie, LayoutDashboard, PiggyBank, ShieldCheck, WalletCards, X } from 'lucide-react';
import { useData } from '../context/useData';
import { loadSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';

const WELCOME_STORAGE_KEY = 'personal_ledger_welcome_seen_v2';

type WelcomeCopy = {
    badge: string;
    title: string;
    intro: string;
    signalTiles: Array<{
        title: string;
        body: string;
    }>;
    startLabel: string;
    primary: string;
    secondary: string;
    budget: string;
    restore: string;
    notesLabel: string;
    notes: string[];
    previewBadge: string;
    previewTitle: string;
    previewBody: string;
    previewRows: Array<{
        title: string;
        note: string;
        progress: string;
        widthClass: string;
    }>;
    stats: Array<{
        label: string;
        note: string;
    }>;
    close: string;
};

const COPY: Record<SiteLanguage, WelcomeCopy> = {
    zh: {
        badge: '首次使用',
        title: '第一次打开，只做三步',
        intro: '不用自己搭结构，也不用先补流水。系统已经放好了常用账户框架，你只需要把数字改成真实情况，就能开始用。',
        signalTiles: [
            {
                title: '本地保存',
                body: '不接银行，不上传服务器。',
            },
            {
                title: '先填数字',
                body: '账户框架已经预先放好。',
            },
            {
                title: '预算能改',
                body: '房租、生活费和转入都能改。',
            },
        ],
        startLabel: '开始方式',
        primary: '从预设结构开始',
        secondary: '直接进入总览',
        budget: '先看预算提醒',
        restore: '恢复之前的数据',
        notesLabel: '开始前你只要记住',
        notes: ['不用新建结构', '不用补流水', '数字随时可改'],
        previewBadge: '上手预览',
        previewTitle: '填完这三步，你就能直接看到完整总览',
        previewBody: '这些步骤完成以后，你就会直接得到首页总览、预算结论和投资组合，不需要再做别的设置。',
        previewRows: [
            {
                title: '银行卡和钱包',
                note: '先把常用账户余额改成真实数字',
                progress: '先填这里',
                widthClass: 'w-[76%]',
            },
            {
                title: '预算提醒',
                note: '再填净收入、房租和生活费',
                progress: '再看预算',
                widthClass: 'w-[58%]',
            },
            {
                title: '首页与投资组合',
                note: '最后检查总资产和结构是否顺手',
                progress: '最后检查',
                widthClass: 'w-[88%]',
            },
        ],
        stats: [
            {
                label: '预设账户',
                note: '银行卡、钱包、券商',
            },
            {
                label: '支持币种',
                note: 'AUD、CNY、USD、SGD、HKD、MYR',
            },
            {
                label: '完成顺序',
                note: '账户 -> 预算 -> 总览',
            },
        ],
        close: '关闭',
    },
    en: {
        badge: 'First use',
        title: 'On the first visit, just do three things',
        intro: 'No need to build a structure first and no need to backfill transactions. The starter account layout is already here. Replace the numbers with the real ones and you can begin.',
        signalTiles: [
            {
                title: 'Saved locally',
                body: 'No bank connection and no server upload.',
            },
            {
                title: 'Start with numbers',
                body: 'The account structure is already prepared.',
            },
            {
                title: 'Budget is editable',
                body: 'Rent, living costs, and transfers are all adjustable.',
            },
        ],
        startLabel: 'How to begin',
        primary: 'Start from the preset structure',
        secondary: 'Go straight to overview',
        budget: 'Open budget first',
        restore: 'Restore previous data',
        notesLabel: 'Before you start',
        notes: ['No need to rebuild structure', 'No need to backfill transactions', 'Numbers can be changed any time'],
        previewBadge: 'Quick preview',
        previewTitle: 'Complete these three steps and the full overview is ready',
        previewBody: 'Once these steps are done, the overview, budget conclusion, and portfolio view are already in place.',
        previewRows: [
            {
                title: 'Bank cards and wallets',
                note: 'Replace the common balances with real numbers',
                progress: 'Start here',
                widthClass: 'w-[76%]',
            },
            {
                title: 'Budget check',
                note: 'Then add income, rent, and living costs',
                progress: 'Review next',
                widthClass: 'w-[58%]',
            },
            {
                title: 'Overview and portfolio',
                note: 'Finally check if the total view feels right',
                progress: 'Final check',
                widthClass: 'w-[88%]',
            },
        ],
        stats: [
            {
                label: 'Starter accounts',
                note: 'Banks, wallets, brokers',
            },
            {
                label: 'Currencies',
                note: 'AUD, CNY, USD, SGD, HKD, MYR',
            },
            {
                label: 'Order',
                note: 'Accounts -> Budget -> Overview',
            },
        ],
        close: 'Close',
    },
};

function shouldShowWelcome() {
    if (typeof window === 'undefined') return false;
    const hasSeenWelcome = window.localStorage.getItem(WELCOME_STORAGE_KEY);
    return !hasSeenWelcome;
}

function delayStyle(ms: number): CSSProperties {
    return { '--enter-delay': `${ms}ms` } as CSSProperties;
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
    const [language] = useState<SiteLanguage>(() => loadSiteLanguage());
    const copy = COPY[language];

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
            <div className="modal-overlay-enter absolute inset-0 bg-slate-950/58 backdrop-blur-md" onClick={dismiss} />

            <div className="modal-panel-enter relative max-h-[calc(100vh-2rem)] w-full max-w-[1060px] overflow-y-auto overscroll-contain rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] shadow-[0_32px_100px_rgba(15,23,42,0.26)] dark:border-white/8 dark:bg-[linear-gradient(180deg,#17191d_0%,#14161a_100%)]">
                <button
                    type="button"
                    onClick={dismiss}
                    className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                    aria-label={copy.close}
                >
                    <X size={15} />
                    {copy.close}
                </button>

                <section className="border-b border-slate-200 p-7 pr-20 dark:border-white/8 sm:p-8 sm:pr-24">
                    <div className="modal-stagger inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] text-white dark:bg-white dark:text-slate-950" style={delayStyle(80)}>
                        <WalletCards size={14} />
                        {copy.badge}
                    </div>

                    <h1 className="modal-stagger editorial-title mt-6 max-w-[15ch] text-[2.45rem] leading-[1.08] text-slate-950 dark:text-white" style={delayStyle(140)}>
                        {copy.title}
                    </h1>
                    <p className="modal-stagger mt-4 max-w-[44rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300" style={delayStyle(200)}>
                        {copy.intro}
                    </p>

                    <div className="mt-7 grid gap-3 md:grid-cols-3">
                        {copy.signalTiles.map((tile, index) => (
                            <SignalTile
                                key={tile.title}
                                icon={
                                    index === 0 ? <ShieldCheck size={17} /> : index === 1 ? <LayoutDashboard size={17} /> : <PiggyBank size={17} />
                                }
                                title={tile.title}
                                body={tile.body}
                                delay={260 + index * 80}
                            />
                        ))}
                    </div>

                    <div className="modal-stagger mt-6 rounded-[28px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/8 dark:bg-[#111318]/60" style={delayStyle(520)}>
                        <p className="text-[11px] font-medium tracking-[0.16em] text-slate-500 dark:text-slate-400">{copy.startLabel}</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={handleGuide}
                                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-90 dark:bg-white dark:text-slate-950 sm:col-span-2"
                            >
                                {copy.primary}
                            </button>
                            <button
                                type="button"
                                onClick={handleStart}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-[#17191d] dark:text-slate-200 dark:hover:text-white"
                            >
                                {copy.secondary}
                            </button>
                            <button
                                type="button"
                                onClick={handleBudget}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-[#17191d] dark:text-slate-200 dark:hover:text-white"
                            >
                                {copy.budget}
                            </button>
                            {hasBackupData && onRestoreBackup && (
                                <button
                                    type="button"
                                    onClick={handleRestore}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-[#17191d] dark:text-slate-200 dark:hover:text-white sm:col-span-2"
                                >
                                    {copy.restore}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="modal-stagger mt-6 rounded-[26px] border border-slate-200 bg-white px-4 py-4 dark:border-white/8 dark:bg-[#17191d]" style={delayStyle(620)}>
                        <p className="text-[11px] font-medium tracking-[0.16em] text-slate-500 dark:text-slate-400">{copy.notesLabel}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {copy.notes.map(note => (
                                <FlowPill key={note} label={note} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="p-7 sm:p-8">
                    <div className="modal-stagger rounded-[32px] border border-slate-200 bg-[linear-gradient(145deg,#faf8f3_0%,#ffffff_100%)] p-5 shadow-[0_16px_38px_rgba(15,23,42,0.05)] dark:border-white/8 dark:bg-[linear-gradient(145deg,#1a1c22_0%,#14161a_100%)] sm:p-6" style={delayStyle(180)}>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] text-slate-600 shadow-sm dark:bg-white/6 dark:text-slate-300">
                            <ChartPie size={13} />
                            {copy.previewBadge}
                        </div>

                        <h2 className="editorial-title mt-5 max-w-[15ch] text-[2rem] leading-[1.15] text-slate-950 dark:text-white">
                            {copy.previewTitle}
                        </h2>
                        <p className="mt-3 max-w-[44rem] text-sm leading-8 text-slate-600 dark:text-slate-300">
                            {copy.previewBody}
                        </p>

                        <div className="mt-5 rounded-[28px] border border-slate-900/10 bg-slate-950 p-4 text-white shadow-[0_20px_50px_rgba(15,23,42,0.22)] dark:border-white/8 dark:bg-[#101216]">
                            <div className="space-y-3">
                                {copy.previewRows.map((row, index) => (
                                    <PreviewRow
                                        key={row.title}
                                        icon={index === 0 ? <WalletCards size={15} /> : index === 1 ? <PiggyBank size={15} /> : <LayoutDashboard size={15} />}
                                        title={row.title}
                                        note={row.note}
                                        progress={row.progress}
                                        widthClass={row.widthClass}
                                        delay={280 + index * 90}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <StatCard value={`${accounts.length}`} label={copy.stats[0].label} note={copy.stats[0].note} delay={560} />
                            <StatCard value="6" label={copy.stats[1].label} note={copy.stats[1].note} delay={640} />
                            <StatCard value="3" label={copy.stats[2].label} note={copy.stats[2].note} delay={720} />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function SignalTile({
    icon,
    title,
    body,
    delay,
}: {
    icon: ReactNode;
    title: string;
    body: string;
    delay: number;
}) {
    return (
        <div className="modal-stagger rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] dark:border-white/8 dark:bg-[#17191d]" style={delayStyle(delay)}>
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/6 dark:text-slate-200">
                    {icon}
                </div>
                <div>
                    <p className="text-[15px] font-medium text-slate-950 dark:text-white">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-slate-500 dark:text-slate-400">{body}</p>
                </div>
            </div>
        </div>
    );
}

function PreviewRow({
    icon,
    title,
    note,
    progress,
    widthClass,
    delay,
}: {
    icon: ReactNode;
    title: string;
    note: string;
    progress: string;
    widthClass: string;
    delay: number;
}) {
    return (
        <div className="modal-stagger rounded-[20px] border border-white/10 bg-white/5 px-4 py-3.5" style={delayStyle(delay)}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100">
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{title}</p>
                        <p className="mt-1 text-[13px] leading-5 text-slate-300">{note}</p>
                    </div>
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

function StatCard({
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
        <div className="modal-stagger rounded-[22px] border border-slate-200 bg-white px-4 py-4 dark:border-white/8 dark:bg-[#17191d]" style={delayStyle(delay)}>
            <p className="text-[11px] font-medium tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2.5 text-[1.6rem] font-medium tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
            <p className="mt-1.5 text-[13px] leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function FlowPill({ label }: { label: string }) {
    return (
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-[#17191d] dark:text-slate-200">
            {label}
        </span>
    );
}
