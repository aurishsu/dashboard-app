import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ArrowUpRight, Landmark, Layers3, WalletCards } from 'lucide-react';
import { useData } from '../context/useData';
import { buildAccountRows, buildCurrencyBreakdown, buildTypeBreakdown } from '../utils/accountMetrics';
import type { AccountType } from '../types/data';

const TYPE_COLORS: Record<AccountType, string> = {
    bank: '#0f172a',
    wallet: '#64748b',
    broker: '#cbd5e1',
};

const TYPE_LABELS: Record<AccountType, string> = {
    bank: '银行卡',
    wallet: '电子钱包',
    broker: '券商',
};

const RADIAN = Math.PI / 180;

const ACCOUNT_ACCENTS: Record<string, { stripe: string; badge: string; fill: string; label: string }> = {
    cba: {
        stripe: 'bg-amber-400',
        badge: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/12 dark:text-amber-300 dark:ring-amber-500/20',
        fill: 'bg-amber-400',
        label: 'CBA',
    },
    hsbc: {
        stripe: 'bg-rose-400',
        badge: 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/12 dark:text-rose-300 dark:ring-rose-500/20',
        fill: 'bg-rose-400',
        label: 'HSBC',
    },
    boc1: {
        stripe: 'bg-red-700',
        badge: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/12 dark:text-red-300 dark:ring-red-500/20',
        fill: 'bg-red-700',
        label: 'BOC',
    },
    boc2: {
        stripe: 'bg-red-700',
        badge: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/12 dark:text-red-300 dark:ring-red-500/20',
        fill: 'bg-red-700',
        label: 'BOC',
    },
    alipay: {
        stripe: 'bg-sky-500',
        badge: 'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/12 dark:text-sky-300 dark:ring-sky-500/20',
        fill: 'bg-sky-500',
        label: '支付宝',
    },
    wechat: {
        stripe: 'bg-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/20',
        fill: 'bg-emerald-500',
        label: '微信',
    },
    ibkr: {
        stripe: 'bg-slate-900 dark:bg-slate-100',
        badge: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
        fill: 'bg-slate-900 dark:bg-slate-100',
        label: 'IBKR',
    },
    moomoo: {
        stripe: 'bg-orange-400',
        badge: 'bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-500/12 dark:text-orange-300 dark:ring-orange-500/20',
        fill: 'bg-orange-400',
        label: 'Moomoo',
    },
};

export function Portfolio() {
    const { accounts, totalUSD, toUSD } = useData();

    const accountRows = buildAccountRows(accounts, toUSD);
    const typeBreakdown = buildTypeBreakdown(accounts, toUSD);
    const currencyBreakdown = buildCurrencyBreakdown(accounts, toUSD);

    const bankAndWalletUSD = accountRows
        .filter(row => row.account.type !== 'broker')
        .reduce((sum, row) => sum + row.usdValue, 0);

    const largestAccount = accountRows[0];
    const brokerCount = accounts.filter(account => account.type === 'broker').length;
    const averageAccountUSD = accounts.length > 0 ? totalUSD / accounts.length : 0;
    const rankedAccounts = accountRows;

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <section className="grid items-stretch gap-6 lg:grid-cols-[1.7fr_1fr]">
                <div className="surface-card p-8">
                    <div className="flex flex-col gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <Layers3 size={14} />
                            投资组合
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">投资组合</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">先看结构，再看每个账户在整个组合里的位置。</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-4">
                        <MetricCard
                            label="组合总规模"
                            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalUSD)}
                            note="按当前汇率折算"
                        />
                        <MetricCard
                            label="最大账户占比"
                            value={largestAccount ? `${largestAccount.share.toFixed(1)}%` : '0%'}
                            note={largestAccount ? largestAccount.account.name : '暂无账户'}
                        />
                        <MetricCard
                            label="流动性资产"
                            value={totalUSD > 0 ? `${((bankAndWalletUSD / totalUSD) * 100).toFixed(1)}%` : '0%'}
                            note="银行卡 + 钱包"
                        />
                        <MetricCard
                            label="券商账户数"
                            value={String(brokerCount)}
                            note={`平均每账户 ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(averageAccountUSD)}`}
                        />
                    </div>
                </div>

                <div className="surface-card flex h-full flex-col justify-between p-6">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Landmark size={18} />
                        <h2 className="text-lg font-black">结构结论</h2>
                    </div>
                    <div className="mt-6 space-y-4">
                        <InsightCard
                            title="集中度"
                            body={largestAccount
                                ? `${largestAccount.account.name} 占总资产 ${largestAccount.share.toFixed(1)}%，这是目前最需要重点关注的单点风险。`
                                : '当前没有足够数据。'}
                        />
                        <InsightCard
                            title="币种覆盖"
                            body={`当前共覆盖 ${currencyBreakdown.length} 个币种，最大的币种暴露是 ${currencyBreakdown[0]?.label ?? 'N/A'}。`}
                        />
                        <InsightCard
                            title="页面目标"
                            body="先看最大的账户和主币种暴露，再决定要不要继续细看下面的明细表。"
                        />
                    </div>
                </div>
            </section>

            <section className="grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-6">
                    <div className="surface-card p-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">按账户类型分配</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">直接基于账户余额聚合。</p>
                        </div>

                        <div className="mt-6 h-[19rem]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeBreakdown}
                                        dataKey="usdValue"
                                        innerRadius={82}
                                        outerRadius={108}
                                        paddingAngle={4}
                                        stroke="none"
                                        labelLine={false}
                                        label={renderTypeCallout}
                                    >
                                        {typeBreakdown.map(row => (
                                            <Cell key={row.key} fill={TYPE_COLORS[row.key as AccountType]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number | string | undefined) => [
                                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value ?? 0)),
                                            'USD Value',
                                        ]}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                            {typeBreakdown.map(row => (
                                <div key={row.key} className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                                    <div className="flex items-center gap-3">
                                        <span className="size-3 rounded-full" style={{ backgroundColor: TYPE_COLORS[row.key as AccountType] }} />
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{TYPE_LABELS[row.key as AccountType]}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{row.count} 个账户</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="metric-value text-xl">{row.share.toFixed(1)}%</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="surface-card p-6">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <Layers3 size={18} />
                            <h2 className="text-lg font-black">币种暴露</h2>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">把组合里真正出现的钱按币种排一遍，方便快速看主暴露。</p>
                        <div className="mt-5 space-y-3">
                            {currencyBreakdown.map(row => (
                                <div key={row.key} className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                                    <div className="flex items-end gap-3">
                                        <p className="text-[1.55rem] font-black tracking-[-0.04em] text-slate-900 dark:text-white">{row.label}</p>
                                        <p className="pb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{row.share.toFixed(1)}% of portfolio</p>
                                    </div>
                                    <p className="text-base font-black text-slate-900 dark:text-white">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-3">
                            <CompactSnapshot
                                label="主暴露"
                                value={currencyBreakdown[0]?.label ?? 'N/A'}
                                note={currencyBreakdown[0] ? `${currencyBreakdown[0].share.toFixed(1)}%` : '暂无数据'}
                            />
                            <CompactSnapshot
                                label="流动性资产"
                                value={totalUSD > 0 ? `${((bankAndWalletUSD / totalUSD) * 100).toFixed(1)}%` : '0%'}
                                note="银行卡 + 钱包"
                            />
                            <CompactSnapshot
                                label="平均账户"
                                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(averageAccountUSD)}
                                note="按当前账户均值"
                            />
                        </div>
                    </div>
                </div>

                <div className="surface-card p-6">
                    <div className="flex items-end justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">账户集中度排名</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">按美元折算从高到低排列。</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            <WalletCards size={14} />
                            全部账户
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {rankedAccounts.map(row => (
                            <div key={row.account.id} className="rounded-[22px] bg-slate-50 p-4 dark:bg-slate-950">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <BrandAccent accountId={row.account.id} />
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-black text-slate-900 dark:text-white">{row.account.name}</p>
                                                <BrandBadge accountId={row.account.id} />
                                            </div>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {TYPE_LABELS[row.account.type]} / 主币种 {row.account.currency} / {row.currencyCount} 个币种
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="metric-value text-[1.55rem]">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                        </p>
                                        <p className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{row.share.toFixed(1)}%</p>
                                    </div>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-900">
                                    <div className={`h-full rounded-full ${getAccountAccent(row.account.id).fill}`} style={{ width: `${row.share}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="surface-card p-6">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">组合明细表</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">每个账户在整个组合中的位置，一次看清。</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        <ArrowUpRight size={14} />
                        不含伪持仓
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="data-table min-w-[720px]">
                        <thead>
                            <tr>
                                <th className="px-2 py-4">账户</th>
                                <th className="px-2 py-4">类型</th>
                                <th className="px-2 py-4">本币余额</th>
                                <th className="px-2 py-4">折算美元</th>
                                <th className="px-2 py-4">占比</th>
                                <th className="px-2 py-4">币种结构</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountRows.map(row => (
                                <tr key={row.account.id}>
                                    <td className="px-2 py-4">
                                        <div className="flex items-center gap-3">
                                            <BrandAccent accountId={row.account.id} compact />
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white">{row.account.name}</p>
                                                <BrandBadge accountId={row.account.id} compact />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">{TYPE_LABELS[row.account.type]}</td>
                                    <td className="px-2 py-4 font-medium text-slate-700 dark:text-slate-200">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: row.account.currency }).format(row.account.balance)}
                                    </td>
                                    <td className="px-2 py-4 metric-value text-xl">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                    </td>
                                    <td className="px-2 py-4 text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">{row.share.toFixed(1)}%</td>
                                    <td className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
                                        {row.currencyCount > 1 ? `${row.currencyCount} 个币种记录` : `单币种 ${row.account.currency}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function renderTypeCallout({
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    percent = 0,
    payload,
}: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    percent?: number;
    payload?: { key?: string };
}) {
    const accountType = (payload?.key as AccountType | undefined) ?? 'bank';
    const label = TYPE_LABELS[accountType];
    const lineColor = TYPE_COLORS[accountType];
    const outerX = cx + (outerRadius + 8) * Math.cos(-midAngle * RADIAN);
    const outerY = cy + (outerRadius + 8) * Math.sin(-midAngle * RADIAN);
    const jointX = cx + (outerRadius + 28) * Math.cos(-midAngle * RADIAN);
    const jointY = cy + (outerRadius + 28) * Math.sin(-midAngle * RADIAN);
    const isRight = jointX >= cx;
    const endX = jointX + (isRight ? 26 : -26);
    const anchor = isRight ? 'start' : 'end';
    const textX = endX + (isRight ? 8 : -8);

    return (
        <g>
            <path d={`M ${outerX} ${outerY} L ${jointX} ${jointY} L ${endX} ${jointY}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
            <circle cx={endX} cy={jointY} r={3} fill={lineColor} />
            <text x={textX} y={jointY - 6} textAnchor={anchor} className="fill-slate-900 text-[13px] font-bold dark:fill-white">
                {label}
            </text>
            <text x={textX} y={jointY + 13} textAnchor={anchor} className="fill-slate-500 text-[12px] font-semibold dark:fill-slate-400">
                {(percent * 100).toFixed(1)}%
            </text>
        </g>
    );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="surface-soft border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)]">
            <p className="text-[12px] font-semibold text-slate-500">{label}</p>
            <p className="metric-value mt-3 text-3xl">{value}</p>
            <p className="metric-note mt-2">{note}</p>
        </div>
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

function CompactSnapshot({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function BrandAccent({ accountId, compact }: { accountId: string; compact?: boolean }) {
    return (
        <span
            className={`shrink-0 rounded-full ${getAccountAccent(accountId).stripe} ${compact ? 'h-9 w-1.5' : 'h-11 w-2'}`}
            aria-hidden="true"
        />
    );
}

function BrandBadge({ accountId, compact }: { accountId: string; compact?: boolean }) {
    const accent = getAccountAccent(accountId);

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${accent.badge} ${compact ? 'mt-1' : ''}`}>
            {accent.label}
        </span>
    );
}

function getAccountAccent(accountId: string) {
    return ACCOUNT_ACCENTS[accountId] ?? {
        stripe: 'bg-slate-400',
        badge: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
        fill: 'bg-slate-400',
        label: '账户',
    };
}
