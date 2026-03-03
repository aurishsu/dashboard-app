import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Layers3, PencilLine, Plus, Trash2, WalletCards } from 'lucide-react';
import { useData } from '../context/useData';
import { CURRENCY_SYMBOLS, type Currency } from '../types/data';

interface CurrencyRow {
    currency: Currency;
    nativeValue: number;
    usdValue: number;
    label: string;
}

const CURRENCIES: Currency[] = ['USD', 'CNY', 'AUD', 'SGD', 'HKD', 'MYR'];

export function BrokerDetails({ brokerId }: { brokerId?: string }) {
    const { id: paramId } = useParams();
    const id = brokerId || paramId;
    const { accounts, updateAccount, updateSubBalance, addSubBalance, deleteSubBalance, deleteAccount, toUSD, totalUSD } = useData();
    const navigate = useNavigate();
    const broker = accounts.find(account => account.id === id);

    const [isEditingEquity, setIsEditingEquity] = useState(false);
    const [equityValue, setEquityValue] = useState(broker?.balance.toString() || '0');
    const [isEditingBP, setIsEditingBP] = useState(false);
    const [buyingPowerValue, setBuyingPowerValue] = useState(broker?.buyingPower?.toString() || '0');
    const [editingSubCurrency, setEditingSubCurrency] = useState<Currency | null>(null);
    const [subBalanceValue, setSubBalanceValue] = useState('0');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!broker) return null;

    const formattedEquity = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: broker.currency,
    }).format(broker.balance);

    const formattedBuyingPower = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: broker.currency,
    }).format(broker.buyingPower ?? 0);

    const primaryUsdValue = toUSD(broker.balance, broker.currency);
    const subBalances = broker.subBalances ?? [];
    const totalUSDValue = primaryUsdValue + subBalances.reduce((sum, subBalance) => sum + toUSD(subBalance.balance, subBalance.currency), 0);
    const portfolioShare = totalUSD > 0 ? (totalUSDValue / totalUSD) * 100 : 0;

    const currencyRows: CurrencyRow[] = [
        {
            currency: broker.currency,
            nativeValue: broker.balance,
            usdValue: primaryUsdValue,
            label: '主币种现金',
        },
        ...subBalances.map(subBalance => ({
            currency: subBalance.currency,
            nativeValue: subBalance.balance,
            usdValue: toUSD(subBalance.balance, subBalance.currency),
            label: '副币种现金',
        })),
    ];

    const visibleCurrencyRows = currencyRows.some(row => row.nativeValue > 0)
        ? currencyRows.filter(row => row.nativeValue > 0)
        : currencyRows;
    const availableSubCurrencies = CURRENCIES.filter(currency => currency !== broker.currency && !subBalances.some(subBalance => subBalance.currency === currency));

    const handleSaveEquity = () => {
        const nextValue = parseFloat(equityValue);
        if (!Number.isNaN(nextValue)) {
            updateAccount(broker.id, { balance: nextValue });
        }
        setIsEditingEquity(false);
    };

    const handleSaveBuyingPower = () => {
        const nextValue = parseFloat(buyingPowerValue);
        if (!Number.isNaN(nextValue)) {
            updateAccount(broker.id, { buyingPower: nextValue });
        }
        setIsEditingBP(false);
    };

    const handleSaveSubBalance = (currency: Currency) => {
        const nextValue = parseFloat(subBalanceValue);
        if (!Number.isNaN(nextValue)) {
            updateSubBalance(broker.id, currency, nextValue);
        }
        setEditingSubCurrency(null);
    };

    const handleAddSubBalance = (currency: Currency) => {
        addSubBalance(broker.id, currency, 0);
        setEditingSubCurrency(currency);
        setSubBalanceValue('');
    };

    const handleDeleteSubBalance = (currency: Currency) => {
        if (editingSubCurrency === currency) {
            setEditingSubCurrency(null);
            setSubBalanceValue('0');
        }
        deleteSubBalance(broker.id, currency);
    };

    const handleDelete = () => {
        deleteAccount(broker.id);
        navigate('/dashboard');
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_42px_rgba(2,6,23,0.34)]">
                <div className="grid gap-0 xl:grid-cols-[minmax(0,1.55fr)_390px] 2xl:grid-cols-[minmax(0,1.65fr)_420px]">
                    <div className="relative p-7 lg:p-8">
                        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_48%),radial-gradient(circle_at_top_left,rgba(148,163,184,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_42%),radial-gradient(circle_at_top_left,rgba(51,65,85,0.28),transparent_34%)]" />
                        <div className="relative space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                <BarChart3 size={14} />
                                券商账户
                            </div>

                            <div>
                                <h1 className="text-[2.15rem] font-black tracking-[-0.05em] text-slate-950 dark:text-white">{broker.name}</h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">这里主要填三个东西: 净值、可用购买力，以及副币种现金。</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <HeroMetricCard
                                    label="主币种"
                                    value={broker.currency}
                                    note="账户默认结算货币"
                                    tone="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                                />
                                <HeroMetricCard
                                    label="账户净值"
                                    value={formattedEquity}
                                    note="券商账户当前净值"
                                    tone="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                                />
                                <HeroMetricCard
                                    label="可用购买力"
                                    value={formattedBuyingPower}
                                    note="可继续投入的现金"
                                    tone="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                                />
                                <HeroMetricCard
                                    label="占总资产"
                                    value={`${portfolioShare.toFixed(1)}%`}
                                    note="在整体资产中的位置"
                                    tone="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                                />
                            </div>
                        </div>
                    </div>

                    <aside className="relative overflow-hidden bg-slate-950 p-7 text-white">
                        <div className="absolute -right-12 top-0 size-44 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -left-10 bottom-0 size-36 rounded-full bg-slate-400/10 blur-3xl" />
                        <div className="relative">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300 ring-1 ring-white/10">
                                <BarChart3 size={14} />
                                Broker Ledger
                            </div>

                            <div className="mt-5 flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                                    <WalletCards size={22} />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">{broker.name}</p>
                                    <p className="mt-1 text-sm text-slate-400">现金工作台</p>
                                </div>
                            </div>

                            <div className="mt-6 overflow-hidden rounded-[20px] bg-white/5 ring-1 ring-white/10">
                                <ProfileRow label="记录币种" value={`${currencyRows.length} 个`} />
                                <ProfileRow label="总折算美元" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalUSDValue)} />
                                <ProfileRow label="账户定位" value="券商现金台账" />
                            </div>

                            <div className="mt-6 rounded-[20px] bg-white/5 p-4 ring-1 ring-white/10">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <Layers3 size={16} />
                                    现金分布
                                </div>
                                <div className="mt-4 space-y-4">
                                    {visibleCurrencyRows.map(row => (
                                        <div key={row.currency}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{row.currency}</p>
                                                    <p className="mt-1 text-xs text-slate-400">{row.label}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-white">
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: row.currency }).format(row.nativeValue)}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.usdValue)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                                                <div
                                                    className="h-full rounded-full bg-white"
                                                    style={{ width: `${totalUSDValue > 0 ? (row.usdValue / totalUSDValue) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="surface-card h-full p-6">
                    <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">常用填写</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">先更新这两个数字，首页和投资组合里的结果就会同步变化。</p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <EditableMetricCard
                            label="账户净值"
                            helper="点击直接修改"
                            isEditing={isEditingEquity}
                            value={formattedEquity}
                            editValue={equityValue}
                            onEditValueChange={setEquityValue}
                            onStartEdit={() => setIsEditingEquity(true)}
                            onSave={handleSaveEquity}
                            onCancel={() => {
                                setEquityValue(broker.balance.toString());
                                setIsEditingEquity(false);
                            }}
                            tone="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                            icon={<BarChart3 size={16} />}
                        />
                        <EditableMetricCard
                            label="可用购买力"
                            helper="保留你真正会参考的现金"
                            isEditing={isEditingBP}
                            value={formattedBuyingPower}
                            editValue={buyingPowerValue}
                            onEditValueChange={setBuyingPowerValue}
                            onStartEdit={() => setIsEditingBP(true)}
                            onSave={handleSaveBuyingPower}
                            onCancel={() => {
                                setBuyingPowerValue((broker.buyingPower ?? 0).toString());
                                setIsEditingBP(false);
                            }}
                            tone="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                            icon={<WalletCards size={16} />}
                        />
                    </div>
                </div>

                <div className="surface-card h-full p-6">
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">副币种现金</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">如果账户里还有 AUD、HKD 这类现金，就在这里单独填。</p>
                        </div>
                        {availableSubCurrencies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {availableSubCurrencies.map(currency => (
                                    <button
                                        key={currency}
                                        type="button"
                                        onClick={() => handleAddSubBalance(currency)}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                                    >
                                        <Plus size={14} />
                                        新增 {currency}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {subBalances.length > 0 ? (
                        <div className="mt-6 grid gap-4">
                            {subBalances.map(subBalance => (
                                <EditableSubBalanceCard
                                    key={subBalance.currency}
                                    currency={subBalance.currency}
                                    balance={subBalance.balance}
                                    isEditing={editingSubCurrency === subBalance.currency}
                                    editValue={editingSubCurrency === subBalance.currency ? subBalanceValue : subBalance.balance.toString()}
                                onStartEdit={() => {
                                    setEditingSubCurrency(subBalance.currency);
                                    setSubBalanceValue(subBalance.balance.toString());
                                }}
                                onEditValueChange={setSubBalanceValue}
                                onSave={() => handleSaveSubBalance(subBalance.currency)}
                                onCancel={() => setEditingSubCurrency(null)}
                                onDelete={() => handleDeleteSubBalance(subBalance.currency)}
                            />
                        ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">当前状态</p>
                            <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">还没有额外币种现金</p>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">如果以后这个券商里新增 AUD、HKD 等现金余额，再在这里单独维护。</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
                >
                    <Trash2 size={16} />
                    删除账户
                </button>
            </div>

            {showDeleteConfirm && (
                <DeleteModal name={broker.name} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />
            )}
        </div>
    );
}

function HeroMetricCard({
    label,
    value,
    note,
    tone,
}: {
    label: string;
    value: string;
    note: string;
    tone: string;
}) {
    return (
        <div className={`min-w-0 rounded-[18px] border p-5 ${tone}`}>
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-4 text-[clamp(1.7rem,1.65vw,2.05rem)] font-bold leading-none tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
            <p className="mt-3 text-sm leading-5 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 last:border-b-0">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

function EditableMetricCard({
    label,
    helper,
    isEditing,
    value,
    editValue,
    onEditValueChange,
    onStartEdit,
    onSave,
    onCancel,
    tone,
    icon,
}: {
    label: string;
    helper: string;
    isEditing: boolean;
    value: string;
    editValue: string;
    onEditValueChange: (value: string) => void;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    tone: string;
    icon: ReactNode;
}) {
    return (
        <div className={`min-w-0 rounded-[20px] border p-5 ${tone}`}>
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex size-8 items-center justify-center rounded-xl bg-white/80 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                    {icon}
                </span>
                {label}
            </div>

            {isEditing ? (
                <div className="mt-4 space-y-3">
                    <input
                        type="number"
                        value={editValue}
                        onChange={event => onEditValueChange(event.target.value)}
                        onKeyDown={event => event.key === 'Enter' && onSave()}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[2rem] font-bold tracking-[-0.03em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={onSave} className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                            保存
                        </button>
                        <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                            取消
                        </button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={onStartEdit} className="mt-4 text-left">
                    <p className="text-[clamp(1.7rem,1.7vw,2.1rem)] font-bold leading-none tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <PencilLine size={16} />
                        {helper}
                    </p>
                </button>
            )}
        </div>
    );
}

function EditableSubBalanceCard({
    currency,
    balance,
    isEditing,
    editValue,
    onStartEdit,
    onEditValueChange,
    onSave,
    onCancel,
    onDelete,
}: {
    currency: Currency;
    balance: number;
    isEditing: boolean;
    editValue: string;
    onStartEdit: () => void;
    onEditValueChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete?: () => void;
}) {
    return (
        <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{currency}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">副币种现金</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                        {CURRENCY_SYMBOLS[currency]} {currency}
                    </span>
                    {onDelete && !isEditing && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="text-sm font-semibold text-rose-500 transition hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-200"
                        >
                            删除
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="mt-4 space-y-3">
                    <input
                        type="number"
                        value={editValue}
                        onChange={event => onEditValueChange(event.target.value)}
                        onKeyDown={event => event.key === 'Enter' && onSave()}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[1.9rem] font-bold tracking-[-0.03em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={onSave} className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                            保存
                        </button>
                        <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                            取消
                        </button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={onStartEdit} className="mt-4 text-left">
                    <p className="text-[1.9rem] font-bold tracking-[-0.03em] text-slate-950 dark:text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(balance)}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <PencilLine size={16} />
                        点击修改
                    </p>
                </button>
            )}
        </div>
    );
}

function DeleteModal({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-[28px] bg-white p-8 shadow-2xl dark:bg-slate-900" onClick={event => event.stopPropagation()}>
                <div className="text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-300">
                        <Trash2 size={28} />
                    </div>
                    <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">删除账户？</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        确认删除 <span className="font-bold text-slate-800 dark:text-slate-200">{name}</span>？此操作不可撤销。
                    </p>
                </div>
                <div className="mt-8 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        取消
                    </button>
                    <button type="button" onClick={onConfirm} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white">
                        确认删除
                    </button>
                </div>
            </div>
        </div>
    );
}
