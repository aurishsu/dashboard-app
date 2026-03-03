import type { ReactNode } from 'react';

interface LedgerHeroMetric {
    label: string;
    value: string;
    note?: string;
}

export function LedgerHero({
    icon,
    eyebrow,
    title,
    description,
    metrics,
    aside,
}: {
    icon: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    metrics: LedgerHeroMetric[];
    aside?: ReactNode;
}) {
    return (
        <section className="surface-card p-7 lg:p-8">
            <div className="flex flex-col gap-7">
                <div className={`grid gap-6 ${aside ? 'xl:grid-cols-[minmax(0,1fr)_320px]' : ''}`}>
                    <div className="space-y-4">
                        <div className="eyebrow-label">
                            {icon}
                            {eyebrow}
                        </div>
                        <div>
                            <h1 className="text-[2.05rem] font-bold tracking-[-0.045em] text-slate-900 dark:text-white lg:text-[2.35rem]">{title}</h1>
                            <p className="metric-note mt-3 max-w-3xl text-[15px]">{description}</p>
                        </div>
                    </div>
                    {aside && <div className="surface-soft h-full p-5 lg:p-6">{aside}</div>}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metrics.map(metric => (
                        <div key={metric.label} className="surface-soft flex min-h-[128px] flex-col justify-between p-5">
                            <div>
                                <p className="text-[12px] font-semibold text-slate-500">{metric.label}</p>
                                <p className="metric-value mt-4 text-[1.9rem] lg:text-[2rem]">{metric.value}</p>
                            </div>
                            {metric.note && <p className="metric-note mt-4 max-w-[26ch] leading-5">{metric.note}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
