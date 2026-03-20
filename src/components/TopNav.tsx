import { NavLink } from 'react-router-dom';
import { CircleHelp, Landmark, Menu, MoonStar, SunMedium } from 'lucide-react';
import { useData } from '../context/useData';
import { useTheme } from '../context/useTheme';

function toDisplayName(rawName?: string) {
    if (!rawName) return '本地用户';
    return rawName
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase() + part.slice(1))
        .join(' ');
}

export function TopNav({
    onOpenWelcome,
    onToggleSidebar,
}: {
    onOpenWelcome?: () => void;
    onToggleSidebar?: () => void;
}) {
    const { accounts } = useData();
    const { isDark, toggleTheme } = useTheme();
    const holderName = accounts.find(account => account.type === 'bank' && account.holderName)?.holderName;
    const displayName = toDisplayName(holderName);

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-[#0f1624]">
            <div className="flex w-full items-center justify-between px-4 py-4 sm:px-5 lg:px-6 2xl:px-7">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 2xl:hidden"
                            aria-label="打开账户侧边栏"
                            title="打开账户侧边栏"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] dark:bg-white dark:text-slate-950">
                            <Landmark size={18} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold tracking-[-0.03em] text-slate-900 dark:text-white">个人资产台账</h2>
                            <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">只记录你真实维护的余额和币种</p>
                        </div>
                    </div>
                    <nav className="hidden items-center gap-2 xl:flex">
                        <NavLink to="/dashboard" className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-semibold transition-all ${isActive ? 'bg-slate-100 text-slate-950 ring-1 ring-slate-200 dark:bg-slate-700/80 dark:text-white dark:ring-slate-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}>首页</NavLink>
                        <NavLink to="/portfolio" className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-semibold transition-all ${isActive ? 'bg-slate-100 text-slate-950 ring-1 ring-slate-200 dark:bg-slate-700/80 dark:text-white dark:ring-slate-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}>投资组合</NavLink>
                        <NavLink to="/budget" className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-semibold transition-all ${isActive ? 'bg-slate-100 text-slate-950 ring-1 ring-slate-200 dark:bg-slate-700/80 dark:text-white dark:ring-slate-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}>预算提醒</NavLink>
                        <NavLink to="/reports" className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-semibold transition-all ${isActive ? 'bg-slate-100 text-slate-950 ring-1 ring-slate-200 dark:bg-slate-700/80 dark:text-white dark:ring-slate-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}>AI 助手</NavLink>
                    </nav>
                </div>

                <div className="flex shrink-0 items-center gap-5">
                    <button
                        type="button"
                        onClick={onOpenWelcome}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        aria-label="打开使用说明"
                        title="打开使用说明"
                    >
                        <CircleHelp size={16} />
                        <span className="hidden text-[13px] sm:inline">说明</span>
                    </button>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
                        title={isDark ? '切换到浅色模式' : '切换到深色模式'}
                    >
                        {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
                        <span className="hidden text-[13px] sm:inline">{isDark ? '浅色' : '深色'}</span>
                    </button>
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-5 dark:border-slate-700">
                        <div className="hidden sm:block text-right">
                            <p className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400">本地记录模式</p>
                        </div>
                        <div className="size-10 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-white shadow-sm dark:bg-slate-800 dark:ring-slate-900">
                            <img
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=e2e8f0`}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
