import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, Landmark, Layers3, PencilLine, WalletCards } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useData } from '../context/useData';
import { type AccountData, type AccountType, type Currency, type ExchangeRates } from '../types/data';
import {
    type AccountRow,
    buildAccountRows,
    buildCurrencyBreakdown,
    buildTypeBreakdown,
    getDistinctCurrencies,
    getZeroValueAccounts,
} from '../utils/accountMetrics';

const CURRENCY_COLORS: Record<string, string> = {
    USD: '#0f172a',
    AUD: '#334155',
    CNY: '#475569',
    HKD: '#64748b',
    MYR: '#94a3b8',
    SGD: '#cbd5e1',
};

const TYPE_COLORS: Record<AccountType, string> = {
    bank: 'bg-slate-900',
    wallet: 'bg-slate-600',
    broker: 'bg-slate-400',
};

const TYPE_BADGES: Record<AccountType, string> = {
    bank: '银行卡',
    wallet: '电子钱包',
    broker: '券商',
};

type EditableRateKey = keyof Pick<ExchangeRates, 'CNY' | 'AUD' | 'MYR' | 'HKD' | 'SGD'>;

export function AssetOverview() {
    const { accounts, totalUSD, exchangeRates, toUSD, updateExchangeRates } = useData();
    const [currency, setCurrency] = useState<Currency>('USD');
    const [hideBalance, setHideBalance] = useState(false);
    const [rateDrafts, setRateDrafts] = useState<Record<EditableRateKey, string>>({
        CNY: exchangeRates.CNY.toString(),
        AUD: exchangeRates.AUD.toString(),
        MYR: exchangeRates.MYR.toString(),
        HKD: exchangeRates.HKD.toString(),
        SGD: exchangeRates.SGD.toString(),
    });

    const rates = { USD: 1, ...exchangeRates };
    const convertedValue = totalUSD * (rates[currency as keyof typeof rates] || 1);

    const accountRows = useMemo(() => buildAccountRows(accounts, toUSD), [accounts, toUSD]);
    const currencyBreakdown = useMemo(() => buildCurrencyBreakdown(accounts, toUSD), [accounts, toUSD]);
    const typeBreakdown = useMemo(() => buildTypeBreakdown(accounts, toUSD), [accounts, toUSD]);
    const distinctCurrencies = useMemo(() => getDistinctCurrencies(accounts), [accounts]);
    const zeroValueAccounts = useMemo(() => getZeroValueAccounts(accounts, toUSD), [accounts, toUSD]);

    const multiCurrencyAccounts = accounts.filter(account => (account.subBalances?.length || 0) > 0);
    const topAccounts = accountRows.slice(0, 5);
    const dustAccounts = accountRows.filter(row => row.usdValue > 0 && row.usdValue < 25);
    const largestAccount = topAccounts[0];
    const largestCurrency = currencyBreakdown[0];
    const reviewQueue = buildReviewQueue({
        zeroValueAccounts,
        dustAccounts,
        multiCurrencyAccounts,
        largestAccount,
    });
    const reviewCount = reviewQueue.length;
    const quickLinks = topAccounts.slice(0, 3);

    const handleSaveRates = () => {
        const nextRates = {
            CNY: parseFloat(rateDrafts.CNY),
            AUD: parseFloat(rateDrafts.AUD),
            MYR: parseFloat(rateDrafts.MYR),
            HKD: parseFloat(rateDrafts.HKD),
            SGD: parseFloat(rateDrafts.SGD),
        };

        if (Object.values(nextRates).every(value => Number.isFinite(value) && value > 0)) {
            updateExchangeRates(nextRates);
        }
    };

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
                <div className="min-w-0 space-y-6">
                    <section className="surface-card relative overflow-hidden p-7 lg:p-8">
                        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_44%),radial-gradient(circle_at_top_left,rgba(148,163,184,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_42%),radial-gradient(circle_at_top_left,rgba(51,65,85,0.3),transparent_34%)]" />
                        <div className="relative grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-5">
                                <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                                    <div className="space-y-3">
                                        <div className="eyebrow-label">
                                            <WalletCards size={14} />
                                            资产总览
                                        </div>
                                        <div>
                                            <h1 className="text-[2.15rem] font-black tracking-[-0.05em] text-slate-900 dark:text-white lg:text-[2.6rem]">你的资产工作台</h1>
                                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                                总资产、多货币换算、集中度和重点账户都放在同一屏里，打开后先看到最重要的数字。
                                            </p>
                                        </div>
                                    </div>

                                    <div className="inline-flex flex-wrap rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/90">
                                        {(['USD', 'CNY', 'AUD', 'SGD', 'HKD', 'MYR'] as Currency[]).map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setCurrency(option)}
                                                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${currency === option ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white dark:shadow-none' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">总资产估值</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <p className="metric-value text-[clamp(3rem,4.2vw,4.7rem)]">
                                            {hideBalance
                                                ? '••••••'
                                                : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(convertedValue)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setHideBalance(current => !current)}
                                            className="rounded-full border border-slate-200 p-3 text-slate-500 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>

                            </div>

                            <div className="surface-soft p-5">
                                <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">当前焦点</p>
                                <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                                    {largestCurrency ? `${largestCurrency.label} 暴露 ${largestCurrency.share.toFixed(1)}%` : '等待更多账户数据'}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    {largestAccount
                                        ? `${largestAccount.account.name} 是当前最大账户，占总资产 ${largestAccount.share.toFixed(1)}%。`
                                        : '继续维护余额后，这里会自动提示当前最值得关注的资产焦点。'}
                                </p>

                                <div className="mt-5 space-y-3">
                                    <FocusRow label="多币种账户" value={`${multiCurrencyAccounts.length} 个`} />
                                    <FocusRow label="零余额账户" value={`${zeroValueAccounts.length} 个`} />
                                    <FocusRow label="待复核事项" value={`${reviewCount} 项`} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SummaryCard label="账户总数" value={String(accounts.length)} note="当前纳入统计的账户" />
                        <SummaryCard label="覆盖币种" value={String(distinctCurrencies.length)} note={distinctCurrencies.join(' / ')} />
                        <SummaryCard label="待复核事项" value={String(reviewCount)} note="零余额、多币种和集中度提醒" />
                    </div>

                    <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
                        <div className="min-w-0 surface-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">币种分布</h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">按美元折算后的真实币种暴露。</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-6">
                                <div className="mx-auto w-full max-w-[320px]">
                                    <div className="relative h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={currencyBreakdown} innerRadius={72} outerRadius={96} paddingAngle={4} dataKey="usdValue" stroke="none">
                                                    {currencyBreakdown.map(row => (
                                                        <Cell key={row.key} fill={CURRENCY_COLORS[row.key] || '#64748b'} />
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
                                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">已记录</p>
                                            <p className="metric-value mt-2 text-3xl">{currencyBreakdown.length}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">个币种</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    {currencyBreakdown.map(row => (
                                        <div key={row.key} className="min-w-0 rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex items-start gap-3">
                                                    <span className="size-3 rounded-full" style={{ backgroundColor: CURRENCY_COLORS[row.key] || '#64748b' }} />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 dark:text-white">{row.label}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">出现于 {row.count} 条余额记录</p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className="metric-value text-xl">{row.share.toFixed(1)}%</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className="h-full rounded-full" style={{ width: `${row.share}%`, backgroundColor: CURRENCY_COLORS[row.key] || '#64748b' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0 surface-card p-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">账户结构</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">按账户类型聚合，看清现金主要放在哪一类账户。</p>
                            </div>

                            <div className="mt-6 space-y-5">
                                {typeBreakdown.map(row => (
                                    <div key={row.key} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{row.label}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{row.count} 个账户</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="metric-value text-xl">{row.share.toFixed(1)}%</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div className={`h-full rounded-full ${TYPE_COLORS[row.key as AccountType]}`} style={{ width: `${row.share}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={18} className="mt-0.5 text-slate-400" />
                                    <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                                        所有占比都来自你当前录入的真实余额和汇率，不需要额外切换模式就能直接比较。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="surface-card p-6">
                        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">核心账户</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">按美元折算排序，直接进到账户详情维护。</p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                <Landmark size={14} />
                                按美元折算排序
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                            {topAccounts.map(row => (
                                <NavLink
                                    key={row.account.id}
                                    to={`/account/${row.account.id}`}
                                    className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                                                {TYPE_BADGES[row.account.type]}
                                            </div>
                                            <h3 className="mt-3 text-lg font-black text-slate-900 dark:text-white">{row.account.name}</h3>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                {row.currencyCount > 1 ? `包含 ${row.currencyCount} 个币种记录` : `主币种 ${row.account.currency}`}
                                            </p>
                                        </div>
                                        <ArrowRight className="text-slate-400 transition-transform group-hover:translate-x-1" />
                                    </div>

                                    <div className="mt-6 flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">折算美元</p>
                                            <p className="metric-value mt-2 text-3xl">
                                                {hideBalance ? '••••••' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">占比</p>
                                            <p className="metric-value mt-2 text-xl">{row.share.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <section className="surface-card overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <Layers3 size={18} />
                                <h2 className="text-lg font-black">今日工作台</h2>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                {reviewCount} 项
                            </span>
                        </div>

                        <div className="p-5">
                            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">当前重点</p>
                                <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                                    {largestCurrency ? `${largestCurrency.label} 币种暴露 ${largestCurrency.share.toFixed(1)}%` : '暂无重点提示'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    {largestAccount
                                        ? `${largestAccount.account.name} 是当前最大账户，占总资产 ${largestAccount.share.toFixed(1)}%。`
                                        : '继续维护余额后，这里会自动更新最值得关注的账户焦点。'}
                                </p>
                            </div>

                            <div className="mt-5 space-y-2">
                                {reviewQueue.length > 0 ? reviewQueue.slice(0, 3).map((item, index) => (
                                    <NavLink
                                        key={item.title}
                                        to={item.to}
                                        className="group flex items-start gap-3 rounded-[18px] bg-slate-50 px-4 py-4 transition hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900"
                                    >
                                        <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}>
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p>
                                        </div>
                                        <ArrowRight className="mt-1 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 dark:text-slate-500" size={18} />
                                    </NavLink>
                                )) : (
                                    <div className="rounded-[18px] bg-slate-50 px-4 py-4 dark:bg-slate-950">
                                        <p className="font-semibold text-slate-900 dark:text-white">当前没有待处理项</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">账户结构看起来已经比较完整，接下来主要是继续更新余额。</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                                <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">快速入口</p>
                                <div className="mt-3 grid gap-2">
                                    {quickLinks.map(row => (
                                        <NavLink
                                            key={row.account.id}
                                            to={`/account/${row.account.id}`}
                                            className="flex items-center justify-between rounded-[16px] bg-white px-4 py-3 ring-1 ring-slate-200 transition hover:ring-slate-300 dark:bg-slate-950 dark:ring-slate-700 dark:hover:ring-slate-600"
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{row.account.name}</p>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)} / {row.share.toFixed(1)}%
                                                </p>
                                            </div>
                                            <PencilLine size={16} className="text-slate-400 dark:text-slate-500" />
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="surface-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white">汇率基准</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">总资产和币种分布都会按这里换算。</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                1 USD
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {(['CNY', 'AUD', 'SGD', 'MYR', 'HKD'] as EditableRateKey[]).map(rateKey => (
                                <label key={rateKey} className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{rateKey}</span>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={rateDrafts[rateKey]}
                                        onChange={event => setRateDrafts(current => ({ ...current, [rateKey]: event.target.value }))}
                                        className="mt-3 w-full border-0 bg-transparent p-0 text-[1.8rem] font-bold tracking-[-0.03em] text-slate-900 focus:outline-none dark:text-white"
                                    />
                                </label>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleSaveRates}
                            className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                        >
                            更新汇率
                        </button>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[18px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            <p className="metric-value mt-3 text-3xl">{value}</p>
            <p className="metric-note mt-2">{note}</p>
        </div>
    );
}

function FocusRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-[14px] bg-white px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

function buildReviewQueue({
    zeroValueAccounts,
    dustAccounts,
    multiCurrencyAccounts,
    largestAccount,
}: {
    zeroValueAccounts: AccountRow[];
    dustAccounts: AccountRow[];
    multiCurrencyAccounts: AccountData[];
    largestAccount?: AccountRow;
}) {
    return [
        zeroValueAccounts.length > 0
            ? {
                title: `清理 ${zeroValueAccounts.length} 个零余额账户`,
                detail: `例如 ${zeroValueAccounts[0].account.name}，可以隐藏、删除或直接补齐真实余额。`,
                to: `/account/${zeroValueAccounts[0].account.id}`,
            }
            : null,
        multiCurrencyAccounts.length > 0
            ? {
                title: `核对 ${multiCurrencyAccounts.length} 个多币种账户`,
                detail: `像 ${multiCurrencyAccounts[0].name} 这类账户，适合定期检查副币种现金有没有变化。`,
                to: `/account/${multiCurrencyAccounts[0].id}`,
            }
            : null,
        largestAccount && largestAccount.share >= 35
            ? {
                title: `关注集中度：${largestAccount.account.name}`,
                detail: `当前占总资产 ${largestAccount.share.toFixed(1)}%，是你最值得优先复核的单一账户。`,
                to: `/account/${largestAccount.account.id}`,
            }
            : null,
        dustAccounts.length > 0
            ? {
                title: `处理 ${dustAccounts.length} 个小额尾差`,
                detail: `例如 ${dustAccounts[0].account.name}，这类低余额账户容易长期占着页面位置。`,
                to: `/account/${dustAccounts[0].account.id}`,
            }
            : null,
    ].filter((item): item is { title: string; detail: string; to: string } => Boolean(item));
}
