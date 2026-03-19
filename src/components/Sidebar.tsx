import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../context/useData';
import {
    type AccountData,
    type Currency,
    type AccountType,
    CURRENCY_SYMBOLS,
    BANK_CARD_THEMES,
    WALLET_THEMES,
} from '../types/data';

const CURRENCIES: Currency[] = ['USD', 'CNY', 'AUD', 'SGD', 'HKD', 'MYR'];

interface NewAccountForm {
    type: AccountType;
    name: string;
    currency: Currency;
    balance: string;
    number: string;
    cardColor: string;
    walletBg: string;
    buyingPower: string;
    holderName: string;
}

const DEFAULT_FORM: NewAccountForm = {
    type: 'bank',
    name: '',
    currency: 'USD',
    balance: '',
    number: '',
    cardColor: BANK_CARD_THEMES[0].value,
    walletBg: WALLET_THEMES[0].value,
    buyingPower: '',
    holderName: '',
};

const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 mx-3 rounded-2xl text-[14px] font-medium transition-all duration-200 ${isActive
        ? 'sidebar-active shadow-sm'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
    }`;

const dotClasses = (isActive: boolean) =>
    `size-2 rounded-full shadow-sm transition-colors duration-200 shrink-0 ${isActive ? 'bg-slate-950 dark:bg-white' : 'bg-slate-300 dark:bg-slate-600'}`;

const SectionHeader = ({ icon, label }: { icon: string; label: string }) => (
    <div className="mb-3 flex items-center gap-2 px-6">
        <span className="material-symbols-outlined text-sm text-slate-400">{icon}</span>
        <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    </div>
);

type SidebarProps = {
    variant?: 'desktop' | 'drawer';
    onNavigate?: () => void;
    onClose?: () => void;
};

export function Sidebar({ variant = 'desktop', onNavigate, onClose }: SidebarProps) {
    const { accounts, addAccount } = useData();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<NewAccountForm>(DEFAULT_FORM);
    const [error, setError] = useState('');
    const isDrawer = variant === 'drawer';

    const handleAdd = () => {
        if (!form.name.trim()) {
            setError('请输入账户名称');
            return;
        }
        const balance = parseFloat(form.balance) || 0;
        const newAccount: Omit<AccountData, 'id'> = {
            type: form.type,
            name: form.name.trim(),
            currency: form.currency,
            balance,
        };
        if (form.type === 'bank') {
            newAccount.cardColor = form.cardColor;
            newAccount.holderName = form.holderName.trim() || 'CARD HOLDER';
            newAccount.number = form.number
                ? `•••• •••• •••• ${form.number.slice(-4)}`
                : '•••• •••• •••• ••••';
            newAccount.limit = '';
            newAccount.validThru = '';
        } else if (form.type === 'wallet') {
            newAccount.bg = form.walletBg;
        } else if (form.type === 'broker') {
            newAccount.buyingPower = parseFloat(form.buyingPower) || 0;
            newAccount.dailyChange = 0;
            newAccount.dailyChangePct = 0;
        }
        const newId = addAccount(newAccount);
        setShowModal(false);
        setForm(DEFAULT_FORM);
        setError('');
        navigate(`/account/${newId}`);
        onNavigate?.();
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(DEFAULT_FORM);
        setError('');
    };

    const banks = accounts.filter(a => a.type === 'bank');
    const wallets = accounts.filter(a => a.type === 'wallet');
    const brokers = accounts.filter(a => a.type === 'broker');
    const bankGroups = banks.reduce<Map<string, { key: string; label: string; accounts: AccountData[] }>>((groups, bank) => {
        if (!bank.bankGroupKey || !bank.bankGroupLabel) return groups;

        const current = groups.get(bank.bankGroupKey);
        if (current) {
            current.accounts.push(bank);
        } else {
            groups.set(bank.bankGroupKey, {
                key: bank.bankGroupKey,
                label: bank.bankGroupLabel,
                accounts: [bank],
            });
        }
        return groups;
    }, new Map());
    const groupedBankKeys = new Set(
        Array.from(bankGroups.values())
            .filter(group => group.accounts.length > 1)
            .map(group => group.key),
    );
    const groupedBanks = banks.filter(bank => !bank.bankGroupKey || !groupedBankKeys.has(bank.bankGroupKey));
    const visibleBankGroups = Array.from(bankGroups.values()).filter(group => group.accounts.length > 1);
    const totalAccounts = accounts.length;
    const asideClassName = isDrawer
        ? 'flex h-full w-full max-w-[360px] flex-col overflow-hidden rounded-r-[28px] border-r border-slate-200 bg-white py-5 shadow-[0_18px_48px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[#111a28]'
        : 'sticky top-4 mr-4 flex min-h-[calc(100vh-6.75rem)] w-[320px] shrink-0 self-start flex-col rounded-[28px] border border-slate-200 bg-white py-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-[#111a28] 2xl:mr-5 2xl:w-[336px]';

    return (
        <>
            <aside className={asideClassName}>
                <div className="border-b border-slate-100 px-6 pb-5 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[12px] font-semibold tracking-[0.06em] text-slate-400">工作区</p>
                            <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">账户</p>
                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{totalAccounts} 个账户正在参与当前统计。</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                aria-label="添加新账户"
                                title="添加新账户"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                            </button>
                            {isDrawer && (
                                <button
                                    onClick={onClose}
                                    className="inline-flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                                    aria-label="关闭侧边栏"
                                    title="关闭侧边栏"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto px-1 pt-6 pb-4">
                    {banks.length > 0 && (
                        <div>
                            <SectionHeader icon="credit_card" label="银行卡" />
                            <div className="space-y-1.5">
                                {groupedBanks.map(acc => (
                                    <NavLink key={acc.id} to={`/account/${acc.id}`} className={linkClasses} onClick={onNavigate}>
                                        {({ isActive }) => (
                                            <>
                                                <span className={dotClasses(isActive)}></span>
                                                <span className="truncate">{acc.name}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                                {visibleBankGroups.map(group => (
                                    <NavLink key={group.key} to={`/bank-group/${group.key}`} className={linkClasses} onClick={onNavigate}>
                                        {({ isActive }) => (
                                            <>
                                                <span className={dotClasses(isActive)}></span>
                                                <span className="truncate">{group.label}</span>
                                                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                                    {group.accounts.length} 张卡
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}

                    {wallets.length > 0 && (
                        <div>
                            <SectionHeader icon="account_balance_wallet" label="手机钱包" />
                            <div className="space-y-1.5">
                                {wallets.map(acc => (
                                    <NavLink key={acc.id} to={`/account/${acc.id}`} className={linkClasses} onClick={onNavigate}>
                                        {({ isActive }) => (
                                            <>
                                                <span className={dotClasses(isActive)}></span>
                                                <span className="truncate">{acc.name}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}

                    {brokers.length > 0 && (
                        <div>
                            <SectionHeader icon="monitoring" label="券商" />
                            <div className="space-y-1.5">
                                {brokers.map(acc => (
                                    <NavLink key={acc.id} to={`/account/${acc.id}`} className={linkClasses} onClick={onNavigate}>
                                        {({ isActive }) => (
                                            <>
                                                <span className={dotClasses(isActive)}></span>
                                                <span className="truncate">{acc.name}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                    <div
                        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">添加新账户</h2>
                                <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <span className="material-symbols-outlined text-slate-500">close</span>
                                </button>
                            </div>

                            {/* Account Type */}
                            <div className="mb-5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">账户类型</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'bank', label: '银行卡', icon: 'credit_card' },
                                        { value: 'wallet', label: '电子钱包', icon: 'account_balance_wallet' },
                                        { value: 'broker', label: '券商', icon: 'monitoring' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setForm(f => ({ ...f, type: opt.value as AccountType }))}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${form.type === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                                        >
                                            <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                                            <span className="text-xs font-bold">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">账户名称</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="例如：工商银行储蓄卡"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                                />
                            </div>

                            {/* Currency */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">货币</label>
                                <div className="flex gap-2 flex-wrap">
                                    {CURRENCIES.map(cur => (
                                        <button
                                            key={cur}
                                            onClick={() => setForm(f => ({ ...f, currency: cur }))}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${form.currency === cur ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                                        >
                                            {cur}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Balance */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">初始余额</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                        {CURRENCY_SYMBOLS[form.currency]}
                                    </span>
                                    <input
                                        type="number"
                                        value={form.balance}
                                        onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Bank-specific */}
                            {form.type === 'bank' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">卡号后四位（可选）</label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={form.number}
                                            onChange={e => setForm(f => ({ ...f, number: e.target.value.replace(/\D/g, '') }))}
                                            placeholder="1234"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">持卡人姓名（可选）</label>
                                        <input
                                            type="text"
                                            value={form.holderName}
                                            onChange={e => setForm(f => ({ ...f, holderName: e.target.value.toUpperCase() }))}
                                            placeholder="YOUR NAME"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">卡片颜色主题</label>
                                        <div className="flex gap-3 flex-wrap">
                                            {BANK_CARD_THEMES.map(cc => (
                                                <button
                                                    key={cc.value}
                                                    onClick={() => setForm(f => ({ ...f, cardColor: cc.value }))}
                                                    title={cc.label}
                                                    className={`w-12 h-8 rounded-lg bg-gradient-to-br ${cc.value} transition-all ${form.cardColor === cc.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Wallet-specific */}
                            {form.type === 'wallet' && (
                                <div className="mb-5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">钱包颜色</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {WALLET_THEMES.map(wc => (
                                            <button
                                                key={wc.value}
                                                onClick={() => setForm(f => ({ ...f, walletBg: wc.value }))}
                                                title={wc.label}
                                                className={`w-12 h-8 rounded-lg ${wc.value} transition-all ${form.walletBg === wc.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Broker-specific */}
                            {form.type === 'broker' && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">可用购买力</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                            {CURRENCY_SYMBOLS[form.currency]}
                                        </span>
                                        <input
                                            type="number"
                                            value={form.buyingPower}
                                            onChange={e => setForm(f => ({ ...f, buyingPower: e.target.value }))}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-rose-500 text-sm font-bold mb-4">{error}</p>}

                            <div className="flex gap-3 mt-4">
                                <button onClick={closeModal} className="flex-1 py-3 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    取消
                                </button>
                                <button onClick={handleAdd} className="flex-1 py-3 rounded-2xl font-bold bg-primary text-white hover:opacity-90 transition-opacity shadow-lg">
                                    确认添加
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
