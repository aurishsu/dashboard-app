import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PencilLine, Wallet, Trash2 } from 'lucide-react';
import { useData } from '../context/useData';
import { normalizeWalletTheme } from '../types/data';

export function WalletDetails({ walletId }: { walletId?: string }) {
    const { id: paramId } = useParams();
    const id = walletId || paramId;
    const { accounts, updateAccount, deleteAccount } = useData();
    const navigate = useNavigate();
    const wallet = accounts.find(account => account.id === id);

    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [balanceValue, setBalanceValue] = useState(wallet?.balance.toString() || '0');
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(wallet?.name || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!wallet) return null;

    const formattedBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: wallet.currency,
    }).format(wallet.balance);

    const handleSaveBalance = () => {
        const nextBalance = parseFloat(balanceValue);
        if (!Number.isNaN(nextBalance)) {
            updateAccount(wallet.id, { balance: nextBalance });
        }
        setIsEditingBalance(false);
    };

    const handleSaveName = () => {
        if (nameValue.trim()) {
            updateAccount(wallet.id, { name: nameValue.trim() });
        }
        setIsEditingName(false);
    };

    const handleDelete = () => {
        deleteAccount(wallet.id);
        navigate('/dashboard');
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <section className={`${normalizeWalletTheme(wallet.bg)} relative overflow-hidden rounded-[32px] px-8 py-10 text-white shadow-xl lg:py-11`}>
                <div className="absolute -right-10 -top-10 size-56 rounded-full bg-white/10 blur-3xl" />
                <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_340px] lg:items-stretch lg:gap-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white/80">
                            <Wallet size={14} />
                            钱包账户
                        </div>
                        {isEditingName ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <input
                                    type="text"
                                    value={nameValue}
                                    onChange={event => setNameValue(event.target.value)}
                                    onKeyDown={event => event.key === 'Enter' && handleSaveName()}
                                    className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-3xl font-black tracking-tight text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/60"
                                    autoFocus
                                />
                                <button type="button" onClick={handleSaveName} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900">
                                    保存名称
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNameValue(wallet.name);
                                        setIsEditingName(false);
                                    }}
                                    className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-bold text-white/90"
                                >
                                    取消
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">{wallet.name}</h1>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingName(true)}
                                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15"
                                >
                                    <PencilLine size={16} />
                                    重命名账户
                                </button>
                            </div>
                        )}
                        <p className="max-w-xl text-sm leading-6 text-white/80">只要更新当前余额和名称，首页与预算页就会自动同步。</p>
                    </div>

                    <div data-onboarding="wallet-balance" className="flex min-h-[220px] min-w-[280px] flex-col justify-between rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/60">当前余额</p>
                        {isEditingBalance ? (
                            <div className="mt-4 space-y-3">
                                <input
                                    type="number"
                                    value={balanceValue}
                                    onChange={event => setBalanceValue(event.target.value)}
                                    onKeyDown={event => event.key === 'Enter' && handleSaveBalance()}
                                    className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-3xl font-black text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button type="button" onClick={handleSaveBalance} className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900">
                                        保存余额
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBalanceValue(wallet.balance.toString());
                                            setIsEditingBalance(false);
                                        }}
                                        className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-bold text-white/90"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setIsEditingBalance(true)} className="mt-3 text-left">
                                <p className="text-4xl font-black tracking-tight">{formattedBalance}</p>
                                <p className="mt-2 text-sm font-medium text-white/70">点击金额即可直接修改</p>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="grid gap-5 md:grid-cols-3">
                <MetricCard label="账户类型" value="电子钱包" note="适合支付宝和微信零钱通这类账户" />
                <MetricCard label="结算币种" value={wallet.currency} note="看到什么币种就按什么币种记录" />
                <MetricCard label="更新方式" value="当前余额" note="看到多少就填多少，不用补流水" />
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:min-h-[270px]">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">使用提示</h2>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">1</p>
                            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">核对名称</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">先确认这是你常用的那个钱包账户。</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">2</p>
                            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">更新余额</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">把当前能看到的余额直接填进去就行。</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">3</p>
                            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">保持同步</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">改完后，首页总资产和预算会一起更新。</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-rose-200 bg-white p-6 shadow-sm dark:border-rose-500/20 dark:bg-slate-900 lg:min-h-[270px]">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">账户操作</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">如果这个钱包不再需要记录，可以在这里删除。</p>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                    >
                        <Trash2 size={16} />
                        删除账户
                    </button>
                </div>
            </section>

            {showDeleteConfirm && (
                <DeleteModal
                    name={wallet.name}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function DeleteModal({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-[28px] bg-white p-8 shadow-2xl dark:bg-slate-900" onClick={event => event.stopPropagation()}>
                <div className="text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400">
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
