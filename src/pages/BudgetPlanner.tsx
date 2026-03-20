import { ArrowRightLeft, House, Plus, Trash2, WalletCards } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useData } from '../context/useData';
import { CURRENCY_SYMBOLS, type Currency } from '../types/data';
import type { EssentialPlan, EssentialPlanKey, SupportSource, SupportSourceCurrency } from '../types/planner';
import { toAUD } from '../utils/plannerMetrics';

const SUPPORT_CURRENCIES: SupportSourceCurrency[] = ['CNY', 'AUD', 'USD', 'MYR', 'SGD', 'HKD'];

function formatAud(value: number, maximumFractionDigits = 0) {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits,
    }).format(value);
}

function getEssentialAmountAud(
    plan: EssentialPlan | undefined,
    exchangeRates: ReturnType<typeof useData>['exchangeRates'],
) {
    if (!plan?.enabled) return 0;
    return plan.currency === 'AUD' ? plan.amount : toAUD(plan.amount, plan.currency, exchangeRates);
}

export function BudgetPlanner() {
    const {
        accounts,
        accountTotalUSD,
        exchangeRates,
        essentialPlans,
        supportSources,
        totalUSD,
        updateEssentialPlan,
        addSupportSource,
        updateSupportSource,
        deleteSupportSource,
    } = useData();

    const rentPlan = essentialPlans.find(plan => plan.key === 'rent');
    const livingPlan = essentialPlans.find(plan => plan.key === 'living');
    const tuitionPlan = essentialPlans.find(plan => plan.key === 'tuition');

    const monthlySupportAud = useMemo(
        () => supportSources.reduce((sum, source) => sum + toAUD(source.amount, source.currency as Currency, exchangeRates), 0),
        [supportSources, exchangeRates],
    );

    const rentAud = getEssentialAmountAud(rentPlan, exchangeRates);
    const livingAud = getEssentialAmountAud(livingPlan, exchangeRates);
    const tuitionAnnualAud = getEssentialAmountAud(tuitionPlan, exchangeRates);
    const tuitionMonthlyReserveAud = tuitionPlan?.enabled ? tuitionAnnualAud / 12 : 0;
    const monthlyEssentialAud = rentAud + livingAud + tuitionMonthlyReserveAud;
    const monthlyFreeAud = monthlySupportAud - monthlyEssentialAud;
    const yearlyFreeAud = monthlyFreeAud * 12;
    const yearlyLivingAud = (rentAud + livingAud) * 12;
    const yearlyTotalNeedAud = yearlyLivingAud + (tuitionPlan?.enabled ? tuitionAnnualAud : 0);
    const livingPoolUSD = useMemo(
        () => accounts
            .filter(account => account.type !== 'broker')
            .reduce((sum, account) => sum + accountTotalUSD(account), 0),
        [accounts, accountTotalUSD],
    );
    const livingPoolAud = livingPoolUSD * exchangeRates.AUD;
    const totalAssetsAud = totalUSD * exchangeRates.AUD;
    const safetyLineAud = monthlyEssentialAud;
    const safetyGapAud = livingPoolAud - safetyLineAud;
    const healthRatio = monthlyEssentialAud > 0 ? monthlySupportAud / monthlyEssentialAud : 0;
    const healthState = monthlyEssentialAud <= 0
        ? 'neutral'
        : healthRatio >= 1.2
            ? 'healthy'
            : healthRatio >= 1
                ? 'tight'
                : 'danger';

    const monthlyBreakdown = [
        ...(rentPlan?.enabled ? [{ key: 'rent', label: '房租', value: rentAud, tone: 'bg-slate-950 dark:bg-slate-100' }] : []),
        ...(livingPlan?.enabled ? [{ key: 'living', label: '生活费', value: livingAud, tone: 'bg-slate-700 dark:bg-slate-300' }] : []),
        ...(tuitionPlan?.enabled ? [{ key: 'tuition', label: '学费月储备', value: tuitionMonthlyReserveAud, tone: 'bg-slate-400 dark:bg-slate-500' }] : []),
    ];
    const flowTotal = Math.max(monthlySupportAud, monthlyEssentialAud, 1);

    const monthlyMessage = monthlyFreeAud >= 0
        ? `按现在这套数字，每月大概还能留出 ${formatAud(monthlyFreeAud)}，一年大概能留出 ${formatAud(yearlyFreeAud)}。`
        : `按现在这套数字，每月还需要补足 ${formatAud(Math.abs(monthlyFreeAud))}，一年大概需要补足 ${formatAud(Math.abs(yearlyFreeAud))}。`;
    const bufferLabel = monthlyEssentialAud <= 0
        ? '等待输入'
        : safetyGapAud >= 0
            ? '已覆盖'
            : '还需补足';

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <section className="surface-card p-6 lg:p-7">
                <div>
                    <div className="eyebrow-label">
                        <WalletCards size={14} />
                        预算提醒
                    </div>
                    <h1 className="mt-4 text-[2.1rem] font-black tracking-[-0.05em] text-slate-950 dark:text-white lg:text-[2.45rem]">月度生存预算</h1>
                    <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        不去做复杂预算，只回答留学生最核心的现金流问题: 每月进来多少钱、固定要花多少钱、银行卡和钱包里的生活资金够不够、年底大概能留下多少。
                    </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <TopStat label="本月净收入" value={formatAud(monthlySupportAud)} />
                    <TopStat label="每月固定成本" value={formatAud(monthlyEssentialAud)} />
                    <TopStat label="月度结果" value={formatAud(Math.abs(monthlyFreeAud))} />
                    <TopStat label="生活资金池" value={formatAud(livingPoolAud)} />
                </div>
            </section>

            <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.12fr)_380px] 2xl:grid-cols-[minmax(0,1.15fr)_420px]">
                <section data-onboarding="budget-input" className="surface-card h-full p-6 lg:p-7">
                        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">预算输入区</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">把本月净收入和固定成本填完，下面所有结论都会同步更新。</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => addSupportSource({ label: `收入来源 ${supportSources.length + 1}`, currency: 'AUD', dueDay: 1 })}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                            >
                                <Plus size={16} />
                                另加一笔收入
                            </button>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ArrowRightLeft size={16} className="text-slate-500 dark:text-slate-400" />
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">本月净收入</h3>
                                </div>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">先把固定转入、兼职、奖学金这些加总。你也可以拆成多笔填，但系统最后只看这个月一共进来多少钱。</p>

                                <div className="mt-4 space-y-3">
                                    {supportSources.map(source => (
                                        <SupportSourceRow
                                            key={source.id}
                                            source={source}
                                            onChange={updateSupportSource}
                                            onDelete={deleteSupportSource}
                                            canDelete={supportSources.length > 1}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <House size={16} className="text-slate-500 dark:text-slate-400" />
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">固定成本开关</h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">房租、生活费、学费都可以单独打开或关闭，适合不同人的实际情况。</p>

                                <div className="mt-4 grid gap-4 xl:grid-cols-3">
                                    <EssentialCostCard
                                        planKey="rent"
                                        title="房租"
                                        description="每个月固定要交的房租"
                                        currency={rentPlan?.currency ?? 'AUD'}
                                        rawAmount={rentPlan?.amount ?? 0}
                                        amountAud={rentAud}
                                        enabled={rentPlan?.enabled ?? false}
                                        cadence="monthly"
                                        onToggle={enabled => updateEssentialPlan('rent', { enabled })}
                                        onAmountChange={value => updateEssentialPlan('rent', { amount: value, enabled: true })}
                                        onCurrencyChange={value => updateEssentialPlan('rent', { currency: value })}
                                    />
                                    <EssentialCostCard
                                        planKey="living"
                                        title="生活费"
                                        description="吃饭、交通、手机费和日常开销"
                                        currency={livingPlan?.currency ?? 'AUD'}
                                        rawAmount={livingPlan?.amount ?? 0}
                                        amountAud={livingAud}
                                        enabled={livingPlan?.enabled ?? false}
                                        cadence="monthly"
                                        onToggle={enabled => updateEssentialPlan('living', { enabled })}
                                        onAmountChange={value => updateEssentialPlan('living', { amount: value, enabled: true })}
                                        onCurrencyChange={value => updateEssentialPlan('living', { currency: value })}
                                    />
                                    <EssentialCostCard
                                        planKey="tuition"
                                        title="学费"
                                        description="如果你自己准备学费，就按全年输入，系统自动平摊到每个月"
                                        currency={tuitionPlan?.currency ?? 'AUD'}
                                        rawAmount={tuitionPlan?.amount ?? 0}
                                        amountAud={tuitionMonthlyReserveAud}
                                        enabled={tuitionPlan?.enabled ?? false}
                                        cadence="yearly"
                                        onToggle={enabled => updateEssentialPlan('tuition', { enabled })}
                                        onAmountChange={value => updateEssentialPlan('tuition', { amount: value, enabled: true })}
                                        onCurrencyChange={value => updateEssentialPlan('tuition', { currency: value })}
                                    />
                                </div>
                            </div>
                        </div>
                </section>

                <HealthGaugeCard
                    incomeAud={monthlySupportAud}
                    safeLineAud={safetyLineAud}
                    healthState={healthState}
                    monthlyFreeAud={monthlyFreeAud}
                    className="h-full"
                />

                <section className="surface-card flex h-full flex-col p-6 lg:p-7">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">每月钱都去哪了</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">用一条简化分配线看这个月的钱被固定成本吃掉多少，还能留下多少。</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-1 flex-col rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">每月固定转入 {formatAud(monthlySupportAud)}</p>
                            <div className="mt-4 h-3.5 overflow-hidden rounded-full bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                                <div className="flex h-full">
                                    {monthlyBreakdown.map(item => (
                                        <div
                                            key={item.key}
                                            className={item.tone}
                                            style={{ width: `${Math.min((item.value / flowTotal) * 100, 100)}%` }}
                                        />
                                    ))}
                                    {monthlyFreeAud > 0 && (
                                        <div className="bg-slate-300 dark:bg-slate-500" style={{ width: `${Math.min((monthlyFreeAud / flowTotal) * 100, 100)}%` }} />
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 flex-1 space-y-3">
                                {monthlyBreakdown.map(item => (
                                    <BreakdownRow key={item.key} label={item.label} value={formatAud(item.value)} tone={item.tone} />
                                ))}
                                <BreakdownRow
                                    label={monthlyFreeAud >= 0 ? '本月剩余空间' : '仍需补足'}
                                    value={formatAud(Math.abs(monthlyFreeAud))}
                                    tone={monthlyFreeAud >= 0 ? 'bg-slate-300 dark:bg-slate-500' : 'bg-slate-500 dark:bg-slate-300'}
                                />
                            </div>
                        </div>
                </section>

                <section className="surface-card h-full p-6 lg:p-7">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                            <div>
                                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">月度结论</p>
                                <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">月度结论</h2>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {monthlyFreeAud >= 0 ? '当前已覆盖' : '当前还需补足'}
                            </span>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <MiniStat label="全年总需求" value={formatAud(yearlyTotalNeedAud)} />
                            <MiniStat
                                label="月度结果"
                                value={formatAud(Math.abs(monthlyFreeAud))}
                                tone={monthlyFreeAud >= 0 ? 'positive' : 'negative'}
                            />
                            <MiniStat label="生活资金池" value={formatAud(livingPoolAud)} />
                            <MiniStat label="总资产参考" value={formatAud(totalAssetsAud)} />
                        </div>

                        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">资金缓冲</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">默认只按银行卡和手机钱包里的钱来判断日常缓冲，券商资产只放在参考里。</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    {bufferLabel}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-4">
                                <ResultCard
                                    label="与本月安全线相比"
                                    value={formatAud(Math.abs(safetyGapAud))}
                                    note={safetyGapAud >= 0 ? '按日常生活资金看，当前已经覆盖这个月的固定成本。' : '按日常生活资金看，当前还没有完全覆盖这个月的固定成本。'}
                                />
                                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{monthlyMessage}</p>
                            </div>
                        </div>
                </section>
            </div>
        </div>
    );
}

function SupportSourceRow({
    source,
    onChange,
    onDelete,
    canDelete,
}: {
    source: SupportSource;
    onChange: (id: string, updates: Partial<SupportSource>) => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
}) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_160px_120px_44px] xl:items-end">
                <InputBlock label="名称">
                    <input
                        type="text"
                        value={source.label}
                        onChange={event => onChange(source.id, { label: event.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-600"
                    />
                </InputBlock>
                <InputBlock label="金额">
                    <CurrencyAmountInput
                        currency={source.currency}
                        value={source.amount}
                        onAmountChange={value => onChange(source.id, { amount: value })}
                    />
                </InputBlock>
                <InputBlock label="币种">
                    <CurrencySelect
                        value={source.currency}
                        onChange={value => onChange(source.id, { currency: value as SupportSourceCurrency })}
                    />
                </InputBlock>
                <button
                    type="button"
                    onClick={() => onDelete(source.id)}
                    disabled={!canDelete}
                    className={`inline-flex items-center justify-center rounded-2xl border px-3 py-3 transition ${canDelete ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white' : 'border-slate-100 bg-slate-100 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-700'}`}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

function EssentialCostCard({
    planKey,
    title,
    description,
    currency,
    rawAmount,
    amountAud,
    enabled,
    cadence,
    onToggle,
    onAmountChange,
    onCurrencyChange,
}: {
    planKey: EssentialPlanKey;
    title: string;
    description: string;
    currency: Currency;
    rawAmount: number;
    amountAud: number;
    enabled: boolean;
    cadence: 'monthly' | 'yearly';
    onToggle: (enabled: boolean) => void;
    onAmountChange: (value: number) => void;
    onCurrencyChange: (value: Currency) => void;
}) {
    const convertedLabel = cadence === 'yearly' ? '折合每月' : '约等于';
    const inputLabel = cadence === 'yearly' ? '每年金额' : '每月金额';

    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <button
                    type="button"
                    onClick={() => onToggle(!enabled)}
                    className={`inline-flex min-w-[68px] justify-center rounded-full px-3 py-1.5 text-xs font-bold transition ${enabled ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}
                >
                    {enabled ? '开启' : '关闭'}
                </button>
            </div>

            {enabled ? (
                <>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px]">
                        <div>
                            <p className="mb-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400">{inputLabel}</p>
                            <CurrencyAmountInput currency={currency} value={rawAmount} onAmountChange={onAmountChange} />
                        </div>
                        <div>
                            <p className="mb-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400">币种</p>
                            <CurrencySelect value={currency} onChange={onCurrencyChange} />
                        </div>
                    </div>
                    <div className="mt-4 rounded-[18px] border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{convertedLabel}</p>
                        <p className="mt-2 text-lg font-black tracking-[-0.03em] text-slate-950 dark:text-white">{formatAud(amountAud)}</p>
                    </div>
                </>
            ) : (
                <div className="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">当前不计入</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {planKey === 'tuition' ? '如果以后需要自己准备学费，再把这个开关打开。' : `如果 ${title} 当前不用自己承担，就先关掉这个开关。`}
                    </p>
                </div>
            )}
        </div>
    );
}

function InputBlock({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <p className="mb-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            {children}
        </div>
    );
}

function CurrencyAmountInput({
    currency,
    value,
    onAmountChange,
}: {
    currency: Currency;
    value: number;
    onAmountChange: (value: number) => void;
}) {
    const displayValue = value === 0 ? '' : String(value);

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-slate-600">
            <span className="inline-flex min-w-[52px] shrink-0 items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {CURRENCY_SYMBOLS[currency]}
            </span>
            <input
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={event => {
                    const sanitized = event.target.value.replace(/[^\d.]/g, '').replace(/^(\d*\.\d*).*$/, '$1');
                    onAmountChange(Number(sanitized || 0));
                }}
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent px-0 py-0 text-lg font-semibold tracking-[-0.02em] text-slate-900 outline-none placeholder:text-slate-300 dark:text-white dark:placeholder:text-slate-600"
            />
        </div>
    );
}

function CurrencySelect({
    value,
    onChange,
}: {
    value: Currency;
    onChange: (value: Currency) => void;
}) {
    return (
        <select
            value={value}
            onChange={event => onChange(event.target.value as Currency)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-600"
        >
            {SUPPORT_CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
            ))}
        </select>
    );
}

function HealthGaugeCard({
    incomeAud,
    safeLineAud,
    healthState,
    monthlyFreeAud,
    className = '',
}: {
    incomeAud: number;
    safeLineAud: number;
    healthState: 'neutral' | 'healthy' | 'tight' | 'danger';
    monthlyFreeAud: number;
    className?: string;
}) {
    const statusMap = {
        neutral: {
            label: '等待输入',
            badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            fill: 'bg-slate-300/70 dark:bg-slate-600/70',
            panel: 'border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)]',
        },
        healthy: {
            label: '已覆盖',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300',
            fill: 'bg-[linear-gradient(90deg,rgba(16,185,129,0.08)_0%,rgba(16,185,129,0.2)_100%)] dark:bg-[linear-gradient(90deg,rgba(16,185,129,0.12)_0%,rgba(16,185,129,0.24)_100%)]',
            panel: 'border-emerald-200 bg-[linear-gradient(180deg,#f6fbf8_0%,#ffffff_100%)] dark:border-emerald-500/20 dark:bg-[linear-gradient(180deg,#0f1e1a_0%,#0f172a_100%)]',
        },
        tight: {
            label: '接近边界',
            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300',
            fill: 'bg-[linear-gradient(90deg,rgba(245,158,11,0.08)_0%,rgba(245,158,11,0.2)_100%)] dark:bg-[linear-gradient(90deg,rgba(245,158,11,0.12)_0%,rgba(245,158,11,0.24)_100%)]',
            panel: 'border-amber-200 bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_100%)] dark:border-amber-500/20 dark:bg-[linear-gradient(180deg,#1b1911_0%,#0f172a_100%)]',
        },
        danger: {
            label: '还需补足',
            badge: 'bg-stone-100 text-stone-700 dark:bg-stone-500/12 dark:text-stone-300',
            fill: 'bg-[linear-gradient(90deg,rgba(148,163,184,0.1)_0%,rgba(71,85,105,0.18)_100%)] dark:bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_0%,rgba(71,85,105,0.26)_100%)]',
            panel: 'border-slate-300 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] dark:border-slate-600 dark:bg-[linear-gradient(180deg,#151922_0%,#0f172a_100%)]',
        },
    }[healthState];

    const chartMax = Math.max(safeLineAud * 1.45, incomeAud * 1.15, 1000);
    const rawSafePercent = chartMax > 0 ? (safeLineAud / chartMax) * 100 : 0;
    const rawIncomePercent = chartMax > 0 ? (incomeAud / chartMax) * 100 : 0;
    const safePercent = Math.min(Math.max(rawSafePercent, 0), 100);
    const incomePercent = Math.min(Math.max(rawIncomePercent, 0), 100);
    const dotPercent = Math.min(Math.max(incomePercent, 1.5), 98.5);
    const markerPercent = Math.min(Math.max(safePercent, 1.5), 98.5);
    const deltaAud = incomeAud - safeLineAud;
    const deltaPercent = Math.abs(incomePercent - safePercent);
    const deltaStart = Math.min(incomePercent, safePercent);
    const statusSummary = healthState === 'neutral'
        ? '先填本月净收入和固定成本'
        : deltaAud >= 0
            ? `当前已覆盖安全线 ${formatAud(deltaAud)}`
            : `当前还需补足 ${formatAud(Math.abs(deltaAud))}`;
    const statusCopy = {
        neutral: '先填本月净收入、房租和生活费，就能知道这个月到底安不安全。',
        healthy: '本月净收入已经盖过安全线，房租和生活费在这套数字里是被覆盖住的。',
        tight: '本月虽然已经盖过安全线，但缓冲不宽，额外开销一多就容易贴边。',
        danger: '本月净收入还没有盖过安全线，房租和生活费还需要额外补足。',
    }[healthState];
    const deltaTone = healthState === 'neutral' ? 'neutral' : deltaAud >= 0 ? 'positive' : 'negative';
    const monthlyFreeTone = healthState === 'neutral'
        ? 'neutral'
        : monthlyFreeAud > 0
            ? 'positive'
            : monthlyFreeAud < 0
                ? 'negative'
                : 'neutral';
    const headline = healthState === 'neutral' ? '先填数字再判断' : statusSummary;

    return (
        <section className={`surface-card p-6 lg:p-7 ${className}`}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">生存线</p>
                    <h2 className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-slate-950 dark:text-white">本月生存线判断</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        只回答一个问题: 你这个月进来的钱，能不能稳稳压过房租和生活费这条线。
                    </p>
                </div>
                <span className={`inline-flex min-w-[72px] justify-center whitespace-nowrap rounded-full px-3 py-1 text-center text-xs font-bold ${statusMap.badge}`}>
                    {statusMap.label}
                </span>
            </div>

            <div className={`mt-6 rounded-[28px] border p-5 ${statusMap.panel}`}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">状态结论</p>
                        <h3 className="mt-3 text-[1.85rem] font-black tracking-[-0.05em] text-slate-950 dark:text-white">{headline}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{statusCopy}</p>
                    </div>
                    <span className={`inline-flex min-w-[72px] justify-center whitespace-nowrap rounded-full px-3 py-1 text-center text-xs font-bold ${statusMap.badge}`}>
                        {statusMap.label}
                    </span>
                </div>

                <div className="mt-5 rounded-[24px] border border-white/70 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/95">
                    <div className="flex flex-wrap items-center gap-3">
                        <LegendPill tone="line" label="黑线 = 本月净收入" />
                        <LegendPill tone="marker" label="虚线 = 本月安全线" />
                    </div>

                    <div className="mt-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                        <span>0</span>
                        <span>{formatAud(chartMax)}</span>
                    </div>

                    <div className="mt-4">
                        <div className="relative h-8">
                            <div className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800" />
                            {healthState !== 'neutral' && deltaPercent > 0.5 && (
                                <div
                                    className={`absolute inset-y-0 rounded-full ${statusMap.fill}`}
                                    style={{ left: `${deltaStart}%`, width: `${deltaPercent}%` }}
                                />
                            )}
                            {incomeAud > 0 && (
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-slate-950 dark:bg-white"
                                    style={{ width: `${incomePercent}%` }}
                                />
                            )}
                            {safeLineAud > 0 && (
                                <div
                                    className="absolute -top-3 bottom-[-12px] border-l-2 border-dashed border-slate-400 dark:border-slate-500"
                                    style={{ left: `${markerPercent}%` }}
                                />
                            )}
                            {incomeAud > 0 && (
                                <div
                                    className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-slate-950 shadow-[0_6px_18px_rgba(15,23,42,0.18)] dark:border-slate-900 dark:bg-white"
                                    style={{ left: `${dotPercent}%` }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <MiniStat label="本月净收入" value={formatAud(incomeAud)} />
                        <MiniStat label="本月安全线" value={formatAud(safeLineAud)} />
                        <MiniStat
                            label="与安全线差距"
                            value={formatAud(Math.abs(deltaAud))}
                            tone={deltaTone}
                        />
                        <MiniStat
                            label="月度结果"
                            value={formatAud(Math.abs(monthlyFreeAud))}
                            tone={monthlyFreeTone}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function LegendPill({ tone, label }: { tone: 'line' | 'marker'; label: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {tone === 'line' ? (
                <span className="h-[3px] w-5 rounded-full bg-slate-950 dark:bg-white" />
            ) : (
                <span className="h-4 border-l-2 border-dashed border-slate-400 dark:border-slate-500" />
            )}
            <span>{label}</span>
        </div>
    );
}

function TopStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-[2rem] font-black tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
        </div>
    );
}

function MiniStat({
    label,
    value,
    tone = 'neutral',
}: {
    label: string;
    value: string;
    tone?: 'neutral' | 'positive' | 'negative';
}) {
    const className = {
        neutral: 'bg-white text-slate-950 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-slate-700',
        positive: 'bg-slate-100 text-slate-950 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700',
        negative: 'bg-slate-100 text-slate-950 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700',
    }[tone];

    return (
        <div className={`rounded-[18px] px-4 py-3 ring-1 ${className}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-base font-black tracking-[-0.02em]">{value}</p>
        </div>
    );
}

function ResultCard({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-[1.9rem] font-black tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function BreakdownRow({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <span className={`size-3 rounded-full ${tone}`} />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
            </div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
        </div>
    );
}
