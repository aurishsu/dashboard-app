import { useState, useEffect, type ReactNode } from 'react';
import { Lock } from 'lucide-react';

const TRIAL_STORAGE_PREFIX = 'feature_trial_start_';
const TRIAL_DAYS = 7;

function getTrialStart(featureKey: string): number | null {
    const stored = localStorage.getItem(`${TRIAL_STORAGE_PREFIX}${featureKey}`);
    return stored ? Number(stored) : null;
}

function initTrial(featureKey: string): number {
    const now = Date.now();
    localStorage.setItem(`${TRIAL_STORAGE_PREFIX}${featureKey}`, String(now));
    return now;
}

function getTrialDaysRemaining(featureKey: string): number {
    let start = getTrialStart(featureKey);
    if (start === null) {
        start = initTrial(featureKey);
    }
    const elapsed = Date.now() - start;
    const remaining = TRIAL_DAYS - Math.floor(elapsed / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
}

function hasFeatureAccess(featureKey: string): boolean {
    return getTrialDaysRemaining(featureKey) > 0;
}

interface FeatureGateProps {
    featureKey: string;
    children: ReactNode;
}

export function FeatureGate({ featureKey, children }: FeatureGateProps) {
    const [daysRemaining, setDaysRemaining] = useState(() => (
        hasFeatureAccess(featureKey) ? getTrialDaysRemaining(featureKey) : 0
    ));

    useEffect(() => {
        // Re-check on mount in case time passed
        setDaysRemaining(getTrialDaysRemaining(featureKey));
    }, [featureKey]);

    if (daysRemaining > 0) {
        return (
            <div>
                <div className="mx-auto mb-6 max-w-7xl">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
                        免费试用还剩 {daysRemaining} 天 / {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left in free trial
                    </div>
                </div>
                {children}
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800">
                <Lock size={28} className="text-slate-400" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-slate-900 dark:text-white">试用已结束 / Trial Expired</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                此功能的 {TRIAL_DAYS} 天免费试用期已结束。请订阅以继续使用。
                <br />
                Your {TRIAL_DAYS}-day free trial for this feature has ended. Subscribe to continue.
            </p>
            <button
                type="button"
                className="mt-8 rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                onClick={() => alert('Subscription flow not yet implemented.')}
            >
                订阅 / Subscribe
            </button>
        </div>
    );
}
