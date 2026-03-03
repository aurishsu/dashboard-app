import { useLocation } from 'react-router-dom';

export function StubPage() {
    const location = useLocation();
    const pathName = location.pathname.split('/').pop() || 'Feature';
    const displayTitle = pathName.charAt(0).toUpperCase() + pathName.slice(1);

    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500 animate-in fade-in zoom-in-95 duration-500">
            <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600">construction</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {displayTitle} - 建设中
            </h1>
            <p className="max-w-md text-center">
                该页面（{location.pathname}）目前为占位符。真实数据和功能正在持续开发中，敬请期待。
            </p>
        </div>
    );
}
