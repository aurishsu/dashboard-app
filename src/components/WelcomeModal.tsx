import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartPie, LayoutDashboard, PiggyBank, ShieldCheck, WalletCards, X } from 'lucide-react';
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
        badge: '新手设置',
        title: '先花一分钟，把资产入口准备好',
        intro: '先走新的设置向导，选你的状态、资产类型和常用机构，再把截图放进准备区。AI 解析层先留空，但入口、节奏和零值桌面先长出来。',
        signalTiles: [
            {
                title: '先用本地草稿',
                body: '设置过程先保存在浏览器里。',
            },
            {
                title: '先准备入口',
                body: '先选机构，再接上传区。',
            },
            {
                title: '先把桌面搭好',
                body: '先把默认模块和打开顺序准备好。',
            },
        ],
        startLabel: '开始方式',
        primary: '打开设置向导',
        secondary: '直接进入总览',
        budget: '先看零值预览',
        restore: '恢复之前的数据',
        notesLabel: '上传前先记住',
        notes: ['不要上传 CVV', '不要上传密码和验证码', '先从最常用的几张截图开始'],
        previewBadge: '设置预览',
        previewTitle: '新的入口会先带你走完设置，再打开零值桌面',
        previewBody: '首页不再直接把人扔进总览，而是先走 setup，确认机构、上传队列和零值 dashboard 的样子。',
        previewRows: [
            {
                title: '画像和资产类型',
                note: '先选你是哪类用户，以及你要放哪些资产',
                progress: '先决定结构',
                widthClass: 'w-[76%]',
            },
            {
                title: '机构和截图队列',
                note: '再选常用银行和钱包，把图片拖进准备区',
                progress: '再放截图',
                widthClass: 'w-[58%]',
            },
            {
                title: '零值桌面',
                note: '最后确认 dashboard 的模块结构和节奏',
                progress: '最后确认',
                widthClass: 'w-[88%]',
            },
        ],
        stats: [
            {
                label: '起手方式',
                note: '设置完成后直接打开桌面',
            },
            {
                label: '上传建议',
                note: '先从最常用的几张截图开始',
            },
            {
                label: '草稿保存',
                note: '先保存在当前浏览器',
            },
        ],
        close: '关闭',
    },
    en: {
        badge: 'New setup',
        title: 'Take a minute and prepare the intake flow first',
        intro: 'Start with the new setup wizard. Choose your profile, asset types, and common institutions first, then queue a few screenshots. The AI layer stays empty for now, but the flow and zero-state workspace should already feel real.',
        signalTiles: [
            {
                title: 'Saved as a local draft',
                body: 'The setup flow stays in this browser first.',
            },
            {
                title: 'Prepare the intake lane',
                body: 'Pick institutions before the upload step.',
            },
            {
                title: 'Build the surface first',
                body: 'Get the intake rhythm and workspace structure in place first.',
            },
        ],
        startLabel: 'How to begin',
        primary: 'Open setup wizard',
        secondary: 'Go straight to overview',
        budget: 'See the zero-state preview first',
        restore: 'Restore previous data',
        notesLabel: 'Before uploading',
        notes: ['Do not upload CVV', 'Do not upload passwords or OTP codes', 'Start with the screenshots you use most often'],
        previewBadge: 'Setup preview',
        previewTitle: 'The new entry now runs through setup before opening the dashboard',
        previewBody: 'The homepage no longer throws people directly into the overview. The new path prepares the setup flow, queue, and zero-state dashboard first.',
        previewRows: [
            {
                title: 'Profile and asset types',
                note: 'Start with the user profile and asset structure',
                progress: 'Shape first',
                widthClass: 'w-[76%]',
            },
            {
                title: 'Sources and queue',
                note: 'Choose institutions and queue screenshots',
                progress: 'Queue',
                widthClass: 'w-[58%]',
            },
            {
                title: 'Zero-state workspace',
                note: 'Confirm the dashboard structure before import',
                progress: 'Review last',
                widthClass: 'w-[88%]',
            },
        ],
        stats: [
            {
                label: 'Main path',
                note: 'Setup finished, then open workspace',
            },
            {
                label: 'Upload tip',
                note: 'Start with the most useful screenshots first',
            },
            {
                label: 'Draft save',
                note: 'Kept in this browser first',
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
    onRestoreBackup,
    hasBackupData,
}: {
    openSignal?: number;
    onRestoreBackup?: () => void;
    hasBackupData?: boolean;
}) {
    const navigate = useNavigate();
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
        navigate('/setup');
    };

    const handleGuide = () => {
        dismiss();
        navigate('/setup');
    };

    const handleBudget = () => {
        dismiss();
        navigate('/setup');
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
                            <StatCard value="3" label={copy.stats[0].label} note={copy.stats[0].note} delay={560} />
                            <StatCard value="7" label={copy.stats[1].label} note={copy.stats[1].note} delay={640} />
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
