import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Landmark, WalletCards } from 'lucide-react';
import { useData } from '../context/useData';
import { CURRENCY_SYMBOLS, normalizeCardTheme } from '../types/data';

export function BankGroupPage() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { accounts, accountTotalUSD } = useData();

    const cards = accounts.filter(
        account => account.type === 'bank' && account.bankGroupKey === groupId,
    );

    if (!groupId || cards.length === 0) {
        return <Navigate to="/dashboard" replace />;
    }

    const title = cards[0].bankGroupLabel || cards[0].name;
    const totalUSD = cards.reduce((sum, card) => sum + accountTotalUSD(card), 0);
    const totalCnyBalance = cards.reduce((sum, card) => sum + (card.currency === 'CNY' ? card.balance : 0), 0);
    const activeCards = cards.filter(card => accountTotalUSD(card) > 0).length;
    const mainCurrencies = Array.from(new Set(cards.map(card => card.currency))).join(' / ');

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <section className="surface-card p-6 lg:p-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                        <div className="eyebrow-label">
                            <Landmark size={14} />
                            银行分组
                        </div>
                        <div>
                            <h1 className="text-[2.05rem] font-black tracking-[-0.05em] text-slate-950 dark:text-white lg:text-[2.5rem]">{title}</h1>
                            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                同一家银行下的多张卡先在这里看总量，再进入单卡维护余额和资料。
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                        <HeaderPill label={`${cards.length} 张卡`} emphasis />
                        <HeaderPill label={`有效卡 ${activeCards} 张`} />
                        <HeaderPill label={`总折算 ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalUSD)}`} />
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[390px_minmax(0,1fr)]">
                <aside className="surface-card p-6">
                    <div className="space-y-4">
                        <div className={`rounded-[30px] bg-gradient-to-br ${normalizeCardTheme(cards[0]?.cardColor)} p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]`}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">Bank Group</p>
                            <h2 className="mt-4 text-[1.9rem] font-black tracking-[-0.04em]">{title}</h2>
                            <p className="mt-3 text-sm leading-6 text-white/75">
                                同组卡片放在一起看，首页侧边栏不再被同一家银行的多张卡塞满。
                            </p>
                        </div>

                        <SummaryBlock label="卡片数量" value={`${cards.length} 张`} note="这家银行当前纳入的卡片" />
                        <SummaryBlock label="活跃卡片" value={`${activeCards} 张`} note="折算后余额大于 0" />
                        <SummaryBlock label="主币种" value={mainCurrencies || 'N/A'} note="按每张卡的主币种汇总" />
                        <SummaryBlock
                            label="人民币余额"
                            value={`${CURRENCY_SYMBOLS.CNY}${Math.round(totalCnyBalance).toLocaleString()}`}
                            note="这里只统计主币种就是 CNY 的银行卡"
                        />
                    </div>
                </aside>

                <section className="surface-card p-6">
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">卡片清单</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">先选卡，再进入单卡页面维护余额和资料。</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <WalletCards size={14} />
                            分组入口
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {cards.map(card => {
                            const totalCardUSD = accountTotalUSD(card);
                            const totalCardLabel = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalCardUSD);
                            const nativeLabel = new Intl.NumberFormat('en-US', { style: 'currency', currency: card.currency }).format(card.balance);
                            const lastFour = extractLastFour(card.number);

                            return (
                                <button
                                    key={card.id}
                                    type="button"
                                    onClick={() => navigate(`/account/${card.id}`)}
                                    className="group grid w-full gap-4 rounded-[26px] border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 xl:grid-cols-[190px_minmax(0,1fr)_170px_24px] xl:items-center"
                                >
                                    <div className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-[24px] bg-gradient-to-br ${normalizeCardTheme(card.cardColor)} p-4 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]`}>
                                        <div className="absolute -right-6 -top-6 size-20 rounded-full bg-white/10 blur-2xl" />
                                        <div className="relative flex h-full flex-col justify-between">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold leading-tight">{title}</p>
                                                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold">{card.currency}</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/65">Tail</p>
                                                <p className="mt-1 font-mono text-base tracking-[0.18em] opacity-90">{lastFour || '----'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-lg font-black tracking-[-0.03em] text-slate-900 dark:text-white">{card.name}</p>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                尾号 {lastFour || '未设置'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {card.holderName || '未设置持卡人'}
                                            {card.validThru ? ` · 有效期 ${card.validThru}` : ''}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {card.subBalances?.length ? `含 ${card.subBalances.length} 个副币种余额` : '当前只有主币种'}
                                        </p>
                                    </div>

                                    <div className="space-y-1 text-left xl:text-right">
                                        <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">主币种余额</p>
                                        <p className="text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">{nativeLabel}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">总折算 {totalCardLabel}</p>
                                    </div>

                                    <ArrowRight className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-white" />
                                </button>
                            );
                        })}
                    </div>
                </section>
            </section>
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

function SummaryBlock({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-[2rem] font-black tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function extractLastFour(masked?: string) {
    if (!masked) return '';
    const match = masked.match(/(\d{4})$/);
    return match?.[1] ?? '';
}
