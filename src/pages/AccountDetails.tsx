import {
    Camera,
    ChevronRight,
    FileImage,
    FileText,
    RefreshCcw,
    Save,
    SquarePen,
    TrendingUp,
    Upload,
} from 'lucide-react';

export function AccountDetails() {
    return (
        <>
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col gap-2 mb-8">
                <nav className="flex text-xs font-medium text-slate-400 gap-2 items-center">
                    <a href="#" className="hover:text-primary">账户管理</a>
                    <ChevronRight size={12} />
                    <a href="#" className="hover:text-primary">银行卡 (中/美/澳)</a>
                    <ChevronRight size={12} />
                    <span className="text-slate-900 dark:text-slate-200">CBA Australia 详情</span>
                </nav>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">账户详情: CBA Australia</h1>
                        <p className="text-slate-500 text-sm mt-1">系统最后同步于: 2023-11-20 09:15:33</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50">
                            <RefreshCcw size={18} />
                            手动刷新
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-navy-accent shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                            <Save size={18} />
                            保存更新
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid: Form + AI Zone */}
            <div className="grid grid-cols-12 gap-8">
                {/* Center: Account Edit Form */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
                            <SquarePen size={18} className="text-primary" />
                            <h2 className="text-lg font-bold">基本信息编辑</h2>
                        </div>

                        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">账户别名</label>
                                    <input type="text" defaultValue="CBA Australia - 日常消费" className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-10 px-3" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">结算币种</label>
                                    <select className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary h-10 px-3" defaultValue="AUD">
                                        <option value="AUD">AUD - 澳元</option>
                                        <option value="USD">USD - 美元</option>
                                        <option value="CNY">CNY - 人民币</option>
                                        <option value="HKD">HKD - 港币</option>
                                        <option value="MYR">MYR - 马来西亚林吉特</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">当前余额 (Balance)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input type="text" defaultValue="12,450.68" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 py-2 pl-8 text-xl font-bold focus:border-primary focus:ring-primary" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">备注信息</label>
                                <textarea rows={4} placeholder="输入账户备注，例如：主要用于房租和水电费支付..." className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary p-3"></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">上月余额对比</p>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">$11,200.00</p>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1 dark:text-slate-400">
                                        <TrendingUp size={14} />
                                        暂时只展示当前录入结果
                                    </p>
                                </div>
                                <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">本月支出合计</p>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">$3,420.15</p>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1 dark:text-slate-400">
                                        <TrendingUp size={14} />
                                        暂不展示波动判断
                                    </p>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>

                {/* Right: AI Smart Recognition */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <section className="rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-8 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/40">Powered by AI</span>
                        </div>

                        <div className="mb-6 size-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-xl group-hover:scale-110 transition-transform">
                            <Camera size={40} strokeWidth={1.8} />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI 智能识图</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[280px] mb-8">
                            拖拽银行账单截图或月结单 PDF 至此，AI 将自动提取余额、日期及收支明细
                        </p>

                        <div className="w-full border-2 border-dashed border-primary/40 rounded-xl p-10 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer">
                            <Upload size={40} className="mb-3 text-slate-300" />
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">点击或拖拽文件上传</p>
                            <p className="text-[11px] text-slate-400 mt-2">支持 PNG, JPG, PDF (最大 10MB)</p>
                        </div>

                        <div className="mt-8 w-full">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500">识别历史记录</span>
                                <a href="#" className="text-xs text-primary hover:underline">查看全部</a>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 text-left">
                                        <FileImage size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs font-bold truncate w-24">CBA_statement_oct.jpg</p>
                                            <p className="text-[10px] text-slate-400">2023-11-19 识别成功</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">$12,450.68</p>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 text-left">
                                        <FileText size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs font-bold truncate w-24">Sept_Summary.pdf</p>
                                            <p className="text-[10px] text-slate-400">2023-10-20 识别成功</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">$11,200.00</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
