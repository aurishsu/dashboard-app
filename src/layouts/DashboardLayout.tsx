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

    useEffect(() => {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingState));
    }, [onboardingState]);

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
            <TopNav onOpenWelcome={() => setWelcomeOpenSignal(signal => signal + 1)} />
            <div className="flex w-full flex-1 items-start overflow-hidden px-3 pb-5 pt-4 lg:px-4 2xl:px-5">
                <Sidebar />
                <main data-app-scroll="true" className="flex-1 overflow-y-auto px-4 py-4 lg:px-5 lg:py-5 2xl:px-6">
                    <Outlet />
                </main>
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
