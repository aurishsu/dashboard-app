import { ArrowUpRight, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';
import { useData } from '../context/useData';
import { buildAccountRows } from '../utils/accountMetrics';

export function Reports() {
    const { accounts, totalUSD, toUSD, essentialPlans } = useData();
    const accountRows = buildAccountRows(accounts, toUSD);
    const topAccount = accountRows[0];
    const topTwoShare = accountRows.slice(0, 2).reduce((sum, row) => sum + row.share, 0);
    const monthlyNeed = essentialPlans
        .filter(plan => plan.enabled && plan.frequency === 'monthly')
        .reduce((sum, plan) => sum + toUSD(plan.amount, plan.currency), 0);

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <div className="surface-card overflow-hidden p-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <MessageSquareText size={14} />
                        AI ASSISTANT
                    </div>
                    <div className="mt-5">
                        <h1 className="text-[clamp(2.4rem,4vw,3.8rem)] font-black tracking-[-0.06em] text-slate-900 dark:text-white">
                            这里以后不再是报表，而是直接和你的资产桌面对话
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                            以后你在这里直接问问题，例如“我现在买这件东西会不会太勉强”“哪个账户更适合支出”“我的钱是不是太分散了”。
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <MetricCard
                            label="当前总资产"
                            value={formatUsd(totalUSD)}
                            note="AI 会围绕你当前桌面回答"
                        />
                        <MetricCard
                            label="最大账户"
                            value={topAccount ? topAccount.account.name : '暂无'}
                            note={topAccount ? `${topAccount.share.toFixed(1)}% of portfolio` : '继续录入后会自动更新'}
                        />
                        <MetricCard
                            label="每月固定压力"
                            value={formatUsd(monthlyNeed)}
                            note="来自已启用的月度固定支出"
                        />
                    </div>
                </div>

                <div className="surface-card p-6">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <ShieldCheck size={18} />
                        <h2 className="text-lg font-black">对话边界</h2>
                    </div>
                    <div className="mt-6 space-y-4">
                        <NoticeCard
                            title="它给的是建议，不是替你做决定"
                            body="你可以拿它来判断支出压力、资产集中度和现金缓冲，但最后决定还是由你自己来做。"
                        />
                        <NoticeCard
                            title="先看你已经放进来的数据"
                            body="AI 会围绕你已经确认过的账户、预算和固定支出继续追问，不会跳出这张桌面乱讲。"
                        />
                        <NoticeCard
                            title="不需要报表页面了"
                            body="后续导出和分析也会从这里发起，重点变成提问、对话和继续确认。"
                        />
                    </div>
                </div>
            </section>

            <section className="surface-card p-6">
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Conversation</p>
                                <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-900 dark:text-white">AI 对话区</h2>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
                                <Sparkles size={14} />
                                Soon
                            </span>
                        </div>

                        <div className="mt-6 space-y-4">
                            <ChatBubble side="user" body="如果我现在想买一个 2000 澳元的沙发，会不会让这个月太紧？" />
                            <ChatBubble
                                side="assistant"
                                body={`基于你当前桌面里的固定月支出 ${formatUsd(monthlyNeed)} 和总资产 ${formatUsd(totalUSD)}，这类问题以后会直接在这里给你分层回答。`}
                            />
                            <ChatBubble
                                side="assistant"
                                body={topAccount
                                    ? `${topAccount.account.name} 现在是最大账户，占组合 ${topAccount.share.toFixed(1)}%。我也会顺手提醒你要不要先从别的账户腾挪。`
                                    : '等数据继续接进来以后，这里会自动结合账户分布继续判断。'}
                            />
                        </div>

                        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center justify-between gap-3">
                                <input
                                    type="text"
                                    value=""
                                    readOnly
                                    placeholder="以后你会在这里继续追问，例如：我这个月还能再花多少？"
                                    className="w-full bg-transparent text-sm text-slate-500 outline-none dark:text-slate-400"
                                />
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white opacity-60 dark:bg-white dark:text-slate-950"
                                >
                                    发送
                                    <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <PromptCard title="我现在能不能花这笔钱？" body="结合固定支出、现金缓冲和最大账户占比，给你一份更像真人助理的判断。" />
                        <PromptCard title="哪个账户更适合支出？" body="按币种、用途和当前分布，告诉你这笔开销放在哪个入口更顺手。" />
                        <PromptCard title="我的钱是不是太分散了？" body={`现在前两个最大入口已经占到 ${topTwoShare.toFixed(1)}%，AI 会继续往下帮你判断是不是该再集中一点。`} />
                    </div>
                </div>
            </section>
        </div>
    );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
            <p className="metric-value mt-3 text-2xl">{value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function NoticeCard({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-[24px] bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-lg font-black text-slate-900 dark:text-white">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
        </div>
    );
}

function ChatBubble({ side, body }: { side: 'user' | 'assistant'; body: string }) {
    const isUser = side === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-[24px] px-5 py-4 text-sm leading-7 ${
                    isUser
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
            >
                {body}
            </div>
        </div>
    );
}

function PromptCard({ title, body }: { title: string; body: string }) {
    return (
        <div className="surface-card p-5">
            <p className="text-lg font-black text-slate-900 dark:text-white">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
        </div>
    );
}

function formatUsd(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
