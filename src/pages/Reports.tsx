import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, Download, Search, ShieldCheck, X } from 'lucide-react';
import { useData } from '../context/useData';
import { buildAccountRows, getDistinctCurrencies, getZeroValueAccounts } from '../utils/accountMetrics';
import type { AccountType } from '../types/data';

const TYPE_LABELS: Record<'all' | AccountType, string> = {
    all: '全部',
    bank: '银行卡',
    wallet: '电子钱包',
    broker: '券商',
};

export function Reports() {
    const { accounts, totalUSD, toUSD, exchangeRates, budgetItems, reminders, essentialPlans, supportPlans, supportSources } = useData();
    const [activeType, setActiveType] = useState<'all' | AccountType>('all');
    const [query, setQuery] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);

    const handleExport = useCallback((mode: 'full' | 'privacy') => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);

        const exportAccounts = accounts.map((account, index) => {
            if (mode === 'privacy') {
                return {
                    id: account.id,
                    name: `Account ${index + 1}`,
                    type: account.type,
                    currency: account.currency,
                    balance: account.balance,
                    subBalances: account.subBalances,
                    ...(account.type === 'broker' ? { dailyChange: account.dailyChange, dailyChangePct: account.dailyChangePct, buyingPower: account.buyingPower } : {}),
                };
            }
            const { ...full } = account;
            return full;
        });

        const exportData = {
            version: '1.0',
            generated_at: now.toISOString(),
            ai_prompt_hint: 'Paste this JSON into ChatGPT or Claude and ask: Analyze my financial health and give me actionable advice.',
            exchange_rates: exchangeRates,
            total_usd: totalUSD,
            accounts: exportAccounts,
            budget_items: budgetItems,
            reminders,
            essential_plans: essentialPlans,
            support_plans: supportPlans,
            support_sources: supportSources,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `harbor-ledger-export-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportModal(false);
    }, [accounts, exchangeRates, totalUSD, budgetItems, reminders, essentialPlans, supportPlans, supportSources]);

    const accountRows = useMemo(() => buildAccountRows(accounts, toUSD), [accounts, toUSD]);
    const zeroValueAccounts = useMemo(() => getZeroValueAccounts(accounts, toUSD), [accounts, toUSD]);
    const distinctCurrencies = useMemo(() => getDistinctCurrencies(accounts), [accounts]);

    const filteredRows = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return accountRows.filter(row => {
            const matchesType = activeType === 'all' || row.account.type === activeType;
            const matchesQuery =
                normalizedQuery.length === 0 ||
                row.account.name.toLowerCase().includes(normalizedQuery) ||
                row.account.currency.toLowerCase().includes(normalizedQuery) ||
                row.account.id.toLowerCase().includes(normalizedQuery);
            return matchesType && matchesQuery;
        });
    }, [accountRows, activeType, query]);

    const multiCurrencyCount = accounts.filter(account => (account.subBalances?.length || 0) > 0).length;
    const largestAccount = accountRows[0];

    return (
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
            <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
                <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            <ShieldCheck size={14} />
                            Ledger Review
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">报表与检查</h1>
                                <button
                                    type="button"
                                    onClick={() => setShowExportModal(true)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                >
                                    <Download size={16} />
                                    导出数据 / Export
                                </button>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                账户清单检查，帮助你快速发现该补、该删、该整理的地方。支持导出全部数据为 JSON 文件。
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-4">
                        <SummaryCard label="纳入统计账户" value={String(accounts.length)} note="当前工作区内全部账户" />
                        <SummaryCard
                            label="总折算美元"
                            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalUSD)}
                            note="用于横向比较"
                        />
                        <SummaryCard label="零余额账户" value={String(zeroValueAccounts.length)} note="建议定期清理或归档" />
                        <SummaryCard label="覆盖币种" value={String(distinctCurrencies.length)} note={distinctCurrencies.join(' / ')} />
                    </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">检查结论</h2>
                    <div className="mt-6 space-y-4">
                        <InsightCard
                            icon={<AlertTriangle size={16} className="text-amber-500" />}
                            title="待清理项"
                            body={zeroValueAccounts.length > 0
                                ? `当前有 ${zeroValueAccounts.length} 个零余额账户，容易占掉注意力。`
                                : '当前没有零余额账户。'}
                        />
                        <InsightCard
                            icon={<ShieldCheck size={16} className="text-emerald-500" />}
                            title="多币种覆盖"
                            body={`共有 ${multiCurrencyCount} 个账户含副币种记录，适合继续保持“主币种 + 副币种余额”这种结构。`}
                        />
                        <InsightCard
                            icon={<ShieldCheck size={16} className="text-slate-700 dark:text-slate-200" />}
                            title="最大账户"
                            body={largestAccount ? `${largestAccount.account.name} 目前是最大账户，占整体 ${largestAccount.share.toFixed(1)}%。` : '暂无足够数据。'}
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'bank', 'wallet', 'broker'] as const).map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setActiveType(type)}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeType === type ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white'}`}
                            >
                                {TYPE_LABELS[type]}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            placeholder="搜索账户名、币种或 id..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[840px] text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-[0.24em] text-slate-400 dark:border-slate-800">
                                <th className="px-2 py-4">账户</th>
                                <th className="px-2 py-4">类型</th>
                                <th className="px-2 py-4">主币种</th>
                                <th className="px-2 py-4">本币余额</th>
                                <th className="px-2 py-4">折算美元</th>
                                <th className="px-2 py-4">币种记录数</th>
                                <th className="px-2 py-4">检查备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map(row => (
                                <tr key={row.account.id} className="border-b border-slate-50 align-top dark:border-slate-900">
                                    <td className="px-2 py-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{row.account.name}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.account.id}</p>
                                    </td>
                                    <td className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">{TYPE_LABELS[row.account.type]}</td>
                                    <td className="px-2 py-4 font-medium text-slate-700 dark:text-slate-200">{row.account.currency}</td>
                                    <td className="px-2 py-4 font-medium text-slate-700 dark:text-slate-200">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: row.account.currency }).format(row.account.balance)}
                                    </td>
                                    <td className="px-2 py-4 font-black text-slate-900 dark:text-white">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                    </td>
                                    <td className="px-2 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{row.currencyCount}</td>
                                    <td className="px-2 py-4">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            {row.usdValue === 0
                                                ? '零余额'
                                                : row.currencyCount > 1
                                                    ? '多币种'
                                                    : '正常'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <p>当前显示 {filteredRows.length} 个账户。</p>
                    <p>筛选和搜索都基于真实账户数据，不再展示伪造的交易流水。</p>
                </div>
            </section>

            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowExportModal(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">导出数据 / Export Data</h2>
                            <button onClick={() => setShowExportModal(false)} className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            选择导出模式。JSON 文件包含账户、余额、汇率、预算计划等全部数据。
                            <br />
                            <span className="text-slate-400 dark:text-slate-500">Choose export mode. The JSON file includes accounts, balances, exchange rates, and budget plans.</span>
                        </p>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => handleExport('full')}
                                className="flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 p-5 text-left transition hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
                            >
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                    <Download size={18} className="text-slate-600 dark:text-slate-300" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">完整导出 / Full Export</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">包含账户名称、卡号、持卡人等所有明细 / Includes account names, card numbers, all details</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleExport('privacy')}
                                className="flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 p-5 text-left transition hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
                            >
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                    <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">隐私导出 / Privacy Export</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">隐藏账户名称和卡号，用通用标签替代 / Hides account names & card numbers, uses generic labels</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function InsightCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
    return (
        <div className="rounded-[24px] bg-slate-50 p-5 dark:bg-slate-950">
            <div className="flex items-center gap-2">
                {icon}
                <p className="font-black text-slate-900 dark:text-white">{title}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
        </div>
    );
}
