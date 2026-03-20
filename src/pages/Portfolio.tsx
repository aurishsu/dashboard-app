import { useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, Landmark, Layers3 } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useData } from '../context/useData';
import { buildAccountRows, buildCurrencyBreakdown, buildTypeBreakdown } from '../utils/accountMetrics';
import type { AccountType } from '../types/data';

type DistributionMode = 'category' | 'account';

type DistributionRow = {
    key: string;
    label: string;
    usdValue: number;
    share: number;
    count: number;
    color: string;
    badge: string;
};

const TYPE_META: Record<AccountType, { label: string; color: string; badge: string }> = {
    bank: { label: '银行卡', color: '#0f172a', badge: '银行卡' },
    wallet: { label: '电子钱包', color: '#64748b', badge: '钱包' },
    broker: { label: '券商', color: '#cbd5e1', badge: '券商' },
};

const ACCOUNT_META: Record<string, { color: string; badge: string; stripe: string; badgeClass: string }> = {
    cba: {
        color: '#f5c542',
        badge: 'CBA',
        stripe: 'bg-amber-400',
        badgeClass: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/12 dark:text-amber-300 dark:ring-amber-500/20',
    },
    hsbc: {
        color: '#db0011',
        badge: 'HSBC',
        stripe: 'bg-rose-500',
        badgeClass: 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/12 dark:text-rose-300 dark:ring-rose-500/20',
    },
    boc1: {
        color: '#b91c1c',
        badge: 'BOC',
        stripe: 'bg-red-700',
        badgeClass: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/12 dark:text-red-300 dark:ring-red-500/20',
    },
    boc2: {
        color: '#b91c1c',
        badge: 'BOC',
        stripe: 'bg-red-700',
        badgeClass: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/12 dark:text-red-300 dark:ring-red-500/20',
    },
    alipay: {
        color: '#1677ff',
        badge: '支付宝',
        stripe: 'bg-sky-500',
        badgeClass: 'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/12 dark:text-sky-300 dark:ring-sky-500/20',
    },
    wechat: {
        color: '#1aad19',
        badge: '微信',
        stripe: 'bg-emerald-500',
        badgeClass: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/20',
    },
    ibkr: {
        color: '#c62857',
        badge: 'IBKR',
        stripe: 'bg-pink-700',
        badgeClass: 'bg-pink-100 text-pink-700 ring-pink-200 dark:bg-pink-500/12 dark:text-pink-300 dark:ring-pink-500/20',
    },
    moomoo: {
        color: '#ff6a3d',
        badge: 'Moomoo',
        stripe: 'bg-orange-400',
        badgeClass: 'bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-500/12 dark:text-orange-300 dark:ring-orange-500/20',
    },
};

export function Portfolio() {
    const { accounts, totalUSD, toUSD } = useData();
    const [mode, setMode] = useState<DistributionMode>('category');
    const [showAllAccounts, setShowAllAccounts] = useState(false);

    const accountRows = useMemo(() => buildAccountRows(accounts, toUSD), [accounts, toUSD]);
    const typeBreakdown = useMemo(() => buildTypeBreakdown(accounts, toUSD), [accounts, toUSD]);
    const currencyBreakdown = useMemo(() => buildCurrencyBreakdown(accounts, toUSD), [accounts, toUSD]);

    const categoryRows = typeBreakdown.map(row => ({
        key: row.key,
        label: row.label,
        usdValue: row.usdValue,
        share: row.share,
        count: row.count,
        color: TYPE_META[row.key as AccountType].color,
        badge: TYPE_META[row.key as AccountType].badge,
    }));

    const accountDistributionRows: DistributionRow[] = accountRows.map(row => ({
        key: row.account.id,
        label: row.account.name,
        usdValue: row.usdValue,
        share: row.share,
        count: row.currencyCount,
        color: getAccountAppearance(row.account.id).color,
        badge: getAccountAppearance(row.account.id).badge,
    }));

    const distributionRows = mode === 'category' ? categoryRows : accountDistributionRows;
    const topAccount = accountRows[0];
    const rankedAccounts = accountRows.filter(row => row.usdValue > 0);
    const leadingAccounts = rankedAccounts.slice(0, 5);
    const remainingAccounts = rankedAccounts.slice(5);
    const remainingShare = remainingAccounts.reduce((sum, row) => sum + row.share, 0);
    const bankAndWalletUSD = accountRows
        .filter(row => row.account.type !== 'broker')
        .reduce((sum, row) => sum + row.usdValue, 0);
    const leadingDistribution = distributionRows[0];
    const visibleAccountRows = showAllAccounts ? rankedAccounts : leadingAccounts;
    const detailedRows = mode === 'category'
        ? categoryRows
        : visibleAccountRows.map(row => ({
            key: row.account.id,
            label: row.account.name,
            usdValue: row.usdValue,
            share: row.share,
            count: row.currencyCount,
            color: getAccountAppearance(row.account.id).color,
            badge: getAccountAppearance(row.account.id).badge,
        }));

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <section className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
                <div className="surface-card overflow-hidden p-8">
                    <div className="flex flex-col gap-3">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <Layers3 size={14} />
                            PORTFOLIO
                        </div>
                        <div className="flex flex-col gap-5">
                            <div>
                                <h1 className="text-[clamp(2.4rem,4vw,3.6rem)] font-black tracking-[-0.06em] text-slate-900 dark:text-white">
                                    先看结构，再看每个入口在整体里站哪一段
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                                    这一页先回答两件事：钱主要堆在哪一类入口里，以及每一个具体账户在整个组合里各占多少。
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <HeroChip label={`组合总额 ${formatUsd(totalUSD)}`} emphasis />
                                <HeroChip label={`${rankedAccounts.length} 个有效账户 / ${currencyBreakdown.length} 个币种`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="surface-card p-6">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Landmark size={18} />
                        <h2 className="text-lg font-black">当前重点</h2>
                    </div>
                    <div className="mt-6 space-y-4">
                        <InsightCard
                            title="最大账户"
                            body={topAccount ? `${topAccount.account.name} 目前占整个组合 ${topAccount.share.toFixed(1)}%。` : '继续录入后，这里会自动抓出当前最大的账户。'}
                        />
                        <InsightCard
                            title="先看的重点"
                            body="先看这一页的大类和账户占比，再决定要不要点进具体账户做维护。"
                        />
                    </div>
                </div>
            </section>

            <section className="surface-card p-6">
                    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-black tracking-[-0.05em] text-slate-900 dark:text-white">资产分布</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">支持按大类看，也支持切到每个具体账户的占比。</p>
                        </div>
                        <div className="inline-flex items-center rounded-full bg-slate-100 p-1 dark:bg-slate-800">
                            <ViewToggle active={mode === 'category'} onClick={() => setMode('category')}>
                                分大类
                            </ViewToggle>
                            <ViewToggle active={mode === 'account'} onClick={() => setMode('account')}>
                                分账户
                            </ViewToggle>
                        </div>
                        {mode === 'account' && rankedAccounts.length > 5 && (
                            <button
                                type="button"
                                onClick={() => setShowAllAccounts(current => !current)}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
                            >
                                {showAllAccounts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {showAllAccounts ? '收起账户' : '展开所有账户'}
                            </button>
                        )}
                    </div>

                    <div className="mt-6 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#101827_0%,#0f172a_100%)]">
                        <SegmentedRail rows={distributionRows} />

                        <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                            <div className="space-y-4">
                                <div className="relative h-[18rem]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributionRows}
                                                dataKey="usdValue"
                                                innerRadius={78}
                                                outerRadius={114}
                                                paddingAngle={4}
                                                stroke="none"
                                                animationDuration={760}
                                            >
                                                {distributionRows.map(row => (
                                                    <Cell key={row.key} fill={row.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value: number | string | undefined) => [formatUsd(Number(value ?? 0)), 'USD']}
                                                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500">{mode === 'category' ? '大类' : '账户'}</p>
                                        <p className="metric-value mt-2 text-4xl">{distributionRows.length}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">个分布单元</p>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <DistributionFocusCard
                                        label={mode === 'category' ? '最大类别' : '最大账户'}
                                        value={leadingDistribution ? leadingDistribution.label : '等待更多数据'}
                                        note={leadingDistribution ? `${leadingDistribution.share.toFixed(1)}% / ${formatUsd(leadingDistribution.usdValue)}` : '继续录入后自动更新'}
                                    />
                                    <DistributionFocusCard
                                        label={mode === 'category' ? '流动性占比' : '前五账户合计'}
                                        value={
                                            mode === 'category'
                                                ? `${totalUSD > 0 ? ((bankAndWalletUSD / totalUSD) * 100).toFixed(1) : '0.0'}%`
                                                : `${leadingAccounts.reduce((sum, row) => sum + row.share, 0).toFixed(1)}%`
                                        }
                                        note={
                                            mode === 'category'
                                                ? '银行卡 + 钱包'
                                                : remainingAccounts.length > 0
                                                    ? `剩余 ${remainingAccounts.length} 个账户合计 ${remainingShare.toFixed(1)}%`
                                                    : '当前已经全部展开'
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {mode === 'category'
                                    ? detailedRows.map(row => (
                                        <DistributionSummaryRow
                                            key={row.key}
                                            color={row.color}
                                            label={row.label}
                                            meta={`${row.count} 个账户`}
                                            share={row.share}
                                            value={formatUsd(row.usdValue)}
                                        />
                                    ))
                                    : visibleAccountRows.map(row => (
                                        <DistributionSummaryRow
                                            key={row.account.id}
                                            color={getAccountAppearance(row.account.id).color}
                                            label={row.account.name}
                                            meta={`${TYPE_META[row.account.type].label} / ${row.currencyCount} 个币种`}
                                            share={row.share}
                                            value={formatUsd(row.usdValue)}
                                            badge={getAccountAppearance(row.account.id).badge}
                                            badgeClass={getAccountAppearance(row.account.id).badgeClass}
                                        />
                                    ))}

                                {mode === 'account' && !showAllAccounts && remainingAccounts.length > 0 && (
                                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            其余 {remainingAccounts.length} 个账户合计占 {remainingShare.toFixed(1)}%
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            上面先保留最值得先看的账户，剩余部分继续算在整张分布里，不再重复铺满一整列。
                                        </p>
                                    </div>
                                )}

                                {mode === 'account' && showAllAccounts && remainingAccounts.length > 0 && (
                                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            已展开全部 {rankedAccounts.length} 个账户
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            现在右侧会把所有有余额的账户都列出来，方便你完整查看每个入口的占比。
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
            </section>

            <section className="surface-card p-6">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                    <div>
                        <h2 className="text-2xl font-black tracking-[-0.05em] text-slate-900 dark:text-white">币种分布</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">先看真实暴露，再看这些币种分别落在哪些账户里。</p>
                    </div>
                    <ArrowUpRight size={18} className="text-slate-400" />
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)]">
                    <SegmentedRail rows={currencyBreakdown.map(row => ({
                        ...row,
                        color: getCurrencyColor(row.key),
                        badge: row.label,
                    }))} />

                    <div className="mt-6 grid gap-3 xl:grid-cols-2">
                        {currencyBreakdown.map(row => (
                            <div key={row.key} className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="size-3 rounded-full" style={{ backgroundColor: getCurrencyColor(row.key) }} />
                                        <div>
                                            <p className="text-xl font-black tracking-[-0.05em] text-slate-900 dark:text-white">{row.label}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">出现于 {row.count} 条余额记录</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="metric-value text-xl">{row.share.toFixed(1)}%</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatUsd(row.usdValue)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div className="h-full rounded-full" style={{ width: `${row.share}%`, backgroundColor: getCurrencyColor(row.key) }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function ViewToggle({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={active
                ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
                : 'rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}
        >
            {children}
        </button>
    );
}

function HeroChip({ label, emphasis }: { label: string; emphasis?: boolean }) {
    return (
        <span className={emphasis
            ? 'inline-flex rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950'
            : 'inline-flex rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}
        >
            {label}
        </span>
    );
}

function InsightCard({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-[24px] bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-lg font-black text-slate-900 dark:text-white">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
        </div>
    );
}

function SegmentedRail({ rows }: { rows: Array<{ key: string; share: number; color: string; label?: string; badge?: string }> }) {
    return (
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                {rows.map(row => (
                    <div
                        key={row.key}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                        style={{ width: `${row.share}%`, backgroundColor: row.color }}
                    />
                ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {rows.map(row => (
                    <span key={row.key} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700">
                        <span className="size-2 rounded-full" style={{ backgroundColor: row.color }} />
                        {row.badge ?? row.label ?? row.key}
                    </span>
                ))}
            </div>
        </div>
    );
}

function DistributionFocusCard({
    label,
    value,
    note,
}: {
    label: string;
    value: string;
    note: string;
}) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-3 text-[1.4rem] font-black leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-white">{value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function DistributionSummaryRow({
    color,
    label,
    meta,
    share,
    value,
    badge,
    badgeClass,
}: {
    color: string;
    label: string;
    meta: string;
    share: number;
    value: string;
    badge?: string;
    badgeClass?: string;
}) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                        <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <p className="truncate text-lg font-black tracking-[-0.04em] text-slate-900 dark:text-white">{label}</p>
                        {badge && badgeClass && (
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${badgeClass}`}>{badge}</span>
                        )}
                    </div>
                    <p className="mt-1 pl-6 text-sm text-slate-500 dark:text-slate-400">{meta}</p>
                </div>
                <div className="text-right">
                    <p className="metric-value text-2xl">{share.toFixed(1)}%</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{value}</p>
                </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

function getAccountAppearance(accountId: string) {
    return ACCOUNT_META[accountId] ?? {
        color: '#64748b',
        badge: '账户',
        stripe: 'bg-slate-500',
        badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
    };
}

function getCurrencyColor(currency: string) {
    const colors: Record<string, string> = {
        USD: '#0f172a',
        AUD: '#334155',
        CNY: '#475569',
        HKD: '#64748b',
        MYR: '#94a3b8',
        SGD: '#cbd5e1',
    };
    return colors[currency] ?? '#64748b';
}

function formatUsd(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
