import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, PencilLine, Plus, Trash2, WalletCards } from 'lucide-react';
import { useData } from '../context/useData';
import { BANK_CARD_THEMES, CURRENCY_SYMBOLS, normalizeCardTheme, type Currency } from '../types/data';

const CURRENCIES: Currency[] = ['USD', 'CNY', 'AUD', 'SGD', 'HKD', 'MYR'];

export function BankCardDetails({ cardId }: { cardId?: string }) {
    const { id: paramId } = useParams();
    const id = cardId || paramId;
    const { accounts, updateAccount, deleteAccount, updateSubBalance, addSubBalance, deleteSubBalance, toUSD } = useData();
    const navigate = useNavigate();

    const card = accounts.find(account => account.id === id);

    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [balanceValue, setBalanceValue] = useState(card?.balance.toString() || '0');
    const [editingSubCurrency, setEditingSubCurrency] = useState<Currency | null>(null);
    const [subBalanceValue, setSubBalanceValue] = useState('0');
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [editName, setEditName] = useState(card?.name || '');
    const [editNumber, setEditNumber] = useState(card?.number || '');
    const [editHolder, setEditHolder] = useState(card?.holderName || '');
    const [editValidThru, setEditValidThru] = useState(card?.validThru || '');
    const [editLimit, setEditLimit] = useState(card?.limit || '');
    const [editCurrency, setEditCurrency] = useState<Currency>(card?.currency || 'USD');
    const [editCardColor, setEditCardColor] = useState(normalizeCardTheme(card?.cardColor));

    if (!card) return null;

    const subBalances = card.subBalances ?? [];
    const isMultiCurrency = subBalances.length > 0;
    const totalUSDValue = toUSD(card.balance, card.currency) + subBalances.reduce((sum, subBalance) => sum + toUSD(subBalance.balance, subBalance.currency), 0);
    const totalUsdLabel = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalUSDValue);
    const lastFour = extractLastFour(card.number);
    const availableSubCurrencies = CURRENCIES.filter(currency => currency !== card.currency && !subBalances.some(subBalance => subBalance.currency === currency));

    const handleSaveBalance = () => {
        const nextValue = parseFloat(balanceValue);
        if (!Number.isNaN(nextValue)) {
            updateAccount(card.id, { balance: nextValue });
        }
        setIsEditingBalance(false);
    };

    const handleSaveSubBalance = (currency: Currency) => {
        const nextValue = parseFloat(subBalanceValue);
        if (!Number.isNaN(nextValue)) {
            updateSubBalance(card.id, currency, nextValue);
        }
        setEditingSubCurrency(null);
    };

    const handleAddSubBalance = (currency: Currency) => {
        addSubBalance(card.id, currency, 0);
        setEditingSubCurrency(currency);
        setSubBalanceValue('');
    };

    const handleDeleteSubBalance = (currency: Currency) => {
        if (editingSubCurrency === currency) {
            setEditingSubCurrency(null);
            setSubBalanceValue('0');
        }
        deleteSubBalance(card.id, currency);
    };

    const handleSaveCardInfo = () => {
        updateAccount(card.id, {
            name: editName.trim() || card.name,
            number: editNumber,
            holderName: editHolder.trim() || card.holderName,
            validThru: editValidThru,
            limit: editLimit,
            currency: editCurrency,
            cardColor: editCardColor,
        });
        setShowEditPanel(false);
    };

    const handleDelete = () => {
        deleteAccount(card.id);
        navigate('/dashboard');
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <section className="surface-card p-6 lg:p-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                        <div className="eyebrow-label">
                            <CreditCard size={14} />
                            银行卡
                        </div>
                        <div>
                            <h1 className="text-[2.05rem] font-black tracking-[-0.05em] text-slate-950 dark:text-white lg:text-[2.5rem]">{card.name}</h1>
                            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                左边只看余额和改余额，右边只负责识别这张卡和维护资料。这样第一屏打开以后，视觉重点和操作重点不会打架。
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                        <HeaderPill label={`主币种 ${card.currency}`} emphasis />
                        <HeaderPill label={`总折算 ${totalUsdLabel}`} />
                        <HeaderPill label={`${1 + subBalances.length} 个币种记录`} />
                    </div>
                </div>
            </section>

            <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.06fr)_minmax(380px,0.94fr)] 2xl:grid-cols-[minmax(0,1.08fr)_minmax(560px,0.92fr)]">
                <section className="surface-card h-full p-6">
                        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">余额工作区</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">先看这张卡当前有多少钱，再决定是否要修改附加币种或资料。</p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                <WalletCards size={14} />
                                最常用入口
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div data-onboarding="bank-balance">
                                <EditableBalancePanel
                                    currency={card.currency}
                                    label={isMultiCurrency ? '主币种余额' : '当前余额'}
                                    isEditing={isEditingBalance}
                                    editValue={balanceValue}
                                    amount={card.balance}
                                    helper="点击直接修改"
                                    primary
                                    onStartEdit={() => {
                                        setIsEditingBalance(true);
                                        setBalanceValue(card.balance.toString());
                                    }}
                                    onEditValueChange={setBalanceValue}
                                    onSave={handleSaveBalance}
                                    onCancel={() => {
                                        setBalanceValue(card.balance.toString());
                                        setIsEditingBalance(false);
                                    }}
                                />
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <MetricPanel
                                    label="折算美元"
                                    value={totalUsdLabel}
                                    note="主币种和副币种统一换算后的总额"
                                />
                                <MetricPanel
                                    label="记录币种"
                                    value={String(1 + subBalances.length)}
                                    note={isMultiCurrency ? '这张卡当前包含副币种现金' : '当前只有主币种'}
                                />
                            </div>
                        </div>
                </section>

                <aside className="space-y-6">
                    <section className="surface-card h-full p-5 lg:p-6">
                        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">卡片识别</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">卡面保持真实比例，方便你一眼确认现在看的到底是哪一张卡。</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEditPanel(current => !current)}
                                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${showEditPanel ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white' : 'bg-slate-950 text-white hover:opacity-90 dark:bg-white dark:text-slate-950'}`}
                            >
                                <PencilLine size={16} />
                                {showEditPanel ? '收起资料编辑' : '编辑卡片资料'}
                            </button>
                        </div>

                        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(360px,420px)_200px] 2xl:justify-between 2xl:items-center">
                            <div className="flex justify-center 2xl:justify-start">
                                <CardPreview
                                    card={card}
                                    isMultiCurrency={isMultiCurrency}
                                    className="max-w-[440px] rounded-[32px] p-6"
                                />
                            </div>

                            <div className="space-y-3 2xl:max-w-[200px]">
                                <InfoRow label="持卡人" value={card.holderName || '未设置'} />
                                <InfoRow label="尾号" value={lastFour || '未设置'} />
                                <InfoRow label="有效期" value={card.validThru || '未设置'} />
                                <InfoRow
                                    label="信用额度"
                                    value={card.limit ? `${CURRENCY_SYMBOLS[card.currency]}${Number(card.limit).toLocaleString()}` : '未记录'}
                                />
                                <InfoRow label="主币种" value={card.currency} />
                            </div>
                        </div>
                    </section>
                </aside>
            </section>

            <section className="surface-card p-6">
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">副币种现金</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {isMultiCurrency ? '同一张卡下的其他币种余额都在这里统一维护。' : '如果这张卡还持有其他币种现金，可以直接在这里补进去。'}
                            </p>
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
                        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                            {subBalances.map(subBalance => (
                                <EditableBalancePanel
                                    key={subBalance.currency}
                                    currency={subBalance.currency}
                                    label={`${subBalance.currency} 余额`}
                                    isEditing={editingSubCurrency === subBalance.currency}
                                    editValue={editingSubCurrency === subBalance.currency ? subBalanceValue : subBalance.balance.toString()}
                                    amount={subBalance.balance}
                                helper="点击直接修改"
                                onDelete={() => handleDeleteSubBalance(subBalance.currency)}
                                onStartEdit={() => {
                                    setEditingSubCurrency(subBalance.currency);
                                    setSubBalanceValue(subBalance.balance.toString());
                                    }}
                                    onEditValueChange={setSubBalanceValue}
                                    onSave={() => handleSaveSubBalance(subBalance.currency)}
                                    onCancel={() => setEditingSubCurrency(null)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">当前状态</p>
                            <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">当前只有主币种记录</p>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">如果这张卡还持有 AUD、MYR、HKD 这类现金，可以从上面直接补一个副币种入口。</p>
                        </div>
                    )}
            </section>

            {showEditPanel && (
                <section className="surface-card animate-in fade-in slide-in-from-top-2 p-6 duration-300 lg:p-7">
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">卡片资料</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">名称、持卡人、尾号和主题色都集中在这里修改。</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-[12px] font-semibold text-slate-500 dark:text-slate-400">账户名称</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={event => setEditName(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[12px] font-semibold text-slate-500 dark:text-slate-400">卡号（显示格式）</label>
                                <input
                                    type="text"
                                    value={editNumber}
                                    onChange={event => setEditNumber(event.target.value)}
                                    placeholder="•••• •••• •••• 1234"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono tracking-widest text-slate-900 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[12px] font-semibold text-slate-500 dark:text-slate-400">持卡人姓名</label>
                                <input
                                    type="text"
                                    value={editHolder}
                                    onChange={event => setEditHolder(event.target.value.toUpperCase())}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono tracking-widest text-slate-900 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[12px] font-semibold text-slate-500 dark:text-slate-400">有效期 (MM/YY)</label>
                                <input
                                    type="text"
                                    value={editValidThru}
                                    onChange={event => setEditValidThru(event.target.value)}
                                    placeholder="12/28"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono tracking-widest text-slate-900 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[12px] font-semibold text-slate-500 dark:text-slate-400">信用额度</label>
                                <input
                                    type="number"
                                    value={editLimit}
                                    onChange={event => setEditLimit(event.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[12px] font-semibold text-slate-500 dark:text-slate-400">主币种</label>
                                <div className="flex flex-wrap gap-2">
                                    {CURRENCIES.map(currency => (
                                        <button
                                            key={currency}
                                            type="button"
                                            onClick={() => setEditCurrency(currency)}
                                            className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all ${editCurrency === currency ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'}`}
                                        >
                                            {currency}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-[12px] font-semibold text-slate-500 dark:text-slate-400">卡片主题</label>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {BANK_CARD_THEMES.map(theme => (
                                    <button
                                        key={theme.value}
                                        type="button"
                                        onClick={() => setEditCardColor(theme.value)}
                                        title={theme.label}
                                        className={`rounded-2xl border p-2 text-left transition ${editCardColor === theme.value ? 'border-slate-900 ring-2 ring-slate-200 dark:border-white dark:ring-slate-700' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'}`}
                                    >
                                        <div className={`h-20 rounded-xl bg-gradient-to-br ${theme.value}`} />
                                        <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{theme.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <button type="button" onClick={handleSaveCardInfo} className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950">
                            保存资料
                        </button>
                        <button type="button" onClick={() => setShowEditPanel(false)} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            取消
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="ml-auto rounded-2xl border border-rose-200 bg-rose-50 px-6 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
                        >
                            删除账户
                        </button>
                    </div>
                </section>
            )}

            {!showEditPanel && (
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
            )}

            {showDeleteConfirm && (
                <DeleteModal
                    name={card.name}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}

function CardPreview({
    card,
    isMultiCurrency,
    className = '',
}: {
    card: {
        name: string;
        number?: string;
        holderName?: string;
        validThru?: string;
        cardColor?: string;
    };
    isMultiCurrency: boolean;
    className?: string;
}) {
    return (
        <div className={`relative aspect-[1.586/1] w-full overflow-hidden bg-gradient-to-br ${normalizeCardTheme(card.cardColor)} text-white shadow-[0_22px_60px_rgba(15,23,42,0.2)] ${className}`}>
            <div className="absolute -right-10 -top-10 size-36 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-8 bottom-0 size-24 rounded-full bg-black/20 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="max-w-[240px] text-[clamp(1rem,1.6vw,1.3rem)] font-semibold leading-tight">{card.name}</p>
                        {isMultiCurrency && (
                            <span className="mt-3 inline-flex rounded-full bg-white/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                                Multi Currency
                            </span>
                        )}
                    </div>
                    <span className="material-symbols-outlined text-[30px] opacity-70">contactless</span>
                </div>

                <div>
                    <div className="mb-5 h-9 w-14 rounded-md border border-amber-300/50 bg-amber-200/80" />
                    <p className="font-mono text-[clamp(1rem,1.5vw,1.2rem)] tracking-[0.16em] opacity-90">
                        {card.number || '•••• •••• •••• ••••'}
                    </p>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="mb-1 text-[10px] uppercase tracking-[0.2em] opacity-60">Card Holder</p>
                        <p className="text-[14px] font-semibold tracking-[0.08em]">{card.holderName || 'CARD HOLDER'}</p>
                    </div>
                    <div className="text-right">
                        <p className="mb-1 text-[10px] uppercase tracking-[0.2em] opacity-60">Valid Thru</p>
                        <p className="font-mono text-[14px] font-semibold tracking-[0.08em]">{card.validThru || '--/--'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HeaderPill({ label, emphasis }: { label: string; emphasis?: boolean }) {
    return (
        <div className={`rounded-full px-4 py-2 text-xs font-semibold ${emphasis ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}>
            {label}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-right text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

function MetricPanel({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            <p className="metric-value mt-3 text-[clamp(1.55rem,2vw,2rem)] leading-none">{value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function EditableBalancePanel({
    currency,
    label,
    isEditing,
    editValue,
    amount,
    helper,
    primary,
    onStartEdit,
    onEditValueChange,
    onSave,
    onCancel,
    onDelete,
}: {
    currency: Currency;
    label: string;
    isEditing: boolean;
    editValue: string;
    amount: number;
    helper: string;
    primary?: boolean;
    onStartEdit: () => void;
    onEditValueChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete?: () => void;
}) {
    const numericValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return (
        <div className="rounded-[26px] border border-slate-200 bg-white p-5 lg:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{currency}</span>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                </div>
                {!isEditing && (
                    <div className="flex items-center gap-3">
                        {onDelete && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="text-sm font-semibold text-rose-500 transition hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-200"
                            >
                                删除
                            </button>
                        )}
                        <button type="button" onClick={onStartEdit} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                            编辑
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="mt-4 space-y-3">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                            {CURRENCY_SYMBOLS[currency]}
                        </span>
                        <input
                            type="number"
                            value={editValue}
                            onChange={event => onEditValueChange(event.target.value)}
                            onKeyDown={event => event.key === 'Enter' && onSave()}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-[clamp(1.9rem,2.6vw,2.5rem)] font-bold tracking-[-0.03em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-slate-600"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onSave} className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950">
                            保存
                        </button>
                        <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            取消
                        </button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={onStartEdit} className="mt-5 block w-full text-left">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                {currency}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Amount</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <span className={`font-semibold text-slate-400 dark:text-slate-500 ${primary ? 'text-base' : 'text-sm'}`}>
                                {CURRENCY_SYMBOLS[currency]}
                            </span>
                            <p className={`metric-value tabular-nums leading-[0.92] ${primary ? 'text-[clamp(2.15rem,2.8vw,2.9rem)]' : 'text-[clamp(1.75rem,2vw,2.2rem)]'}`}>
                                {numericValue}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="text-xs font-semibold tracking-[0.02em] text-slate-400 dark:text-slate-500">{label}</span>
                    </div>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <PencilLine size={15} />
                        {helper}
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

function extractLastFour(masked?: string) {
    if (!masked) return '';
    const match = masked.match(/(\d{4})$/);
    return match?.[1] ?? '';
}
