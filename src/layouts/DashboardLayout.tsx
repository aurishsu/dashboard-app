import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopNav } from '../components/TopNav';
import { Sidebar } from '../components/Sidebar';
import { WelcomeModal } from '../components/WelcomeModal';
import { OnboardingGuide } from '../components/OnboardingGuide';
import { CornerConfetti } from '../components/CornerConfetti';
import { useData } from '../context/useData';

const ONBOARDING_STORAGE_KEY = 'personal_ledger_onboarding_v1';

type OnboardingState = {
    active: boolean;
    completed: boolean;
    step: 0 | 1 | 2 | 3;
};

function loadOnboardingState(): OnboardingState {
    if (typeof window === 'undefined') {
        return { active: false, completed: false, step: 0 };
    }

    try {
        const saved = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!saved) return { active: false, completed: false, step: 0 };

        const parsed = JSON.parse(saved) as Partial<OnboardingState>;
        return {
            active: Boolean(parsed.active),
            completed: Boolean(parsed.completed),
            step: parsed.step === 1 || parsed.step === 2 || parsed.step === 3 ? parsed.step : 0,
        };
    } catch {
        return { active: false, completed: false, step: 0 };
    }
}

export function DashboardLayout() {
    const navigate = useNavigate();
    const { accounts, resetToStarterData, restoreBackupData, hasBackupData } = useData();
    const [welcomeOpenSignal, setWelcomeOpenSignal] = useState(0);
    const [celebrationKey, setCelebrationKey] = useState(0);
    const [onboardingState, setOnboardingState] = useState<OnboardingState>(() => loadOnboardingState());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingState));
    }, [onboardingState]);

    useEffect(() => {
        if (!sidebarOpen) return undefined;

        const previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
        };
    }, [sidebarOpen]);

    const firstBankAccount = accounts.find(account => account.type === 'bank' && account.id !== 'boc2') ?? accounts.find(account => account.type === 'bank');
    const firstWalletAccount = accounts.find(account => account.type === 'wallet');

    const beginGuide = () => {
        resetToStarterData();
        setOnboardingState({ active: true, completed: false, step: 1 });
        setCelebrationKey(key => key + 1);
        navigate(`/account/${firstBankAccount?.id ?? 'cba'}`);
    };

    const finishGuide = () => {
        setOnboardingState({ active: false, completed: true, step: 0 });
        setCelebrationKey(key => key + 1);
        navigate('/dashboard');
    };

    const skipGuide = () => {
        setOnboardingState({ active: false, completed: true, step: 0 });
    };

    const restoreBackup = () => {
        restoreBackupData();
        setOnboardingState(current => ({ ...current, active: false, step: 0 }));
        navigate('/dashboard');
    };

    const advanceGuide = () => {
        if (onboardingState.step === 1) {
            setOnboardingState({ active: true, completed: false, step: 2 });
            navigate(`/account/${firstWalletAccount?.id ?? 'alipay'}`);
            return;
        }

        if (onboardingState.step === 2) {
            setOnboardingState({ active: true, completed: false, step: 3 });
            navigate('/budget');
            return;
        }

        finishGuide();
    };

    const activeGuideStep = onboardingState.step === 1 || onboardingState.step === 2 || onboardingState.step === 3
        ? onboardingState.step
        : 1;

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <TopNav
                onOpenWelcome={() => setWelcomeOpenSignal(signal => signal + 1)}
                onToggleSidebar={() => setSidebarOpen(current => !current)}
            />
            <div className="flex w-full min-w-0 flex-1 items-start overflow-hidden px-3 pb-5 pt-4 sm:px-4 lg:px-5 2xl:px-5">
                <div className="hidden 2xl:block">
                    <Sidebar />
                </div>
                <main data-app-scroll="true" className="min-w-0 flex-1 overflow-y-auto px-1 py-4 sm:px-2 lg:px-3 lg:py-5 2xl:px-6">
                    <Outlet />
                </main>
            </div>
            <div className={`fixed inset-0 z-30 2xl:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
                <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="关闭账户侧边栏"
                />
                <div className={`absolute inset-y-0 left-0 transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar variant="drawer" onNavigate={() => setSidebarOpen(false)} onClose={() => setSidebarOpen(false)} />
                </div>
            </div>
            <WelcomeModal
                key={welcomeOpenSignal}
                openSignal={welcomeOpenSignal}
                onStartGuide={beginGuide}
                onRestoreBackup={hasBackupData ? restoreBackup : undefined}
                hasBackupData={hasBackupData}
            />
            {onboardingState.active && onboardingState.step > 0 && (
                <OnboardingGuide
                    step={activeGuideStep}
                    onNext={advanceGuide}
                    onSkip={skipGuide}
                    onRestore={hasBackupData ? restoreBackup : undefined}
                    hasBackupData={hasBackupData}
                />
            )}
            {celebrationKey > 0 && <CornerConfetti key={celebrationKey} burstKey={celebrationKey} />}
        </div>
    );
}
