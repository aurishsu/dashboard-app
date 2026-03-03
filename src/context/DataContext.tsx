import { useState, useEffect, useMemo, useCallback } from 'react';

import {
    type Currency,
    type AccountData,
    type ExchangeRates,
    DEFAULT_RATES,
    createStarterAccounts,
    normalizeAccounts,
    normalizeExchangeRates,
} from '../types/data';
import {
    type BudgetItem,
    type EssentialPlan,
    type EssentialPlanKey,
    type ReminderItem,
    normalizeBudgetItems,
    normalizeEssentialPlans,
    normalizeReminders,
    normalizeSupportPlans,
    type SupportPlan,
    type SupportPlanKey,
    DEFAULT_SUPPORT_PLANS,
    type SupportSource,
    STARTER_ESSENTIAL_PLANS,
    STARTER_SUPPORT_SOURCES,
    normalizeSupportSources,
} from '../types/planner';
import { DataContext } from './data-context';
import { advanceMonthlyDueDate, advanceYearlyDueDate } from '../utils/plannerMetrics';

const STORAGE_KEY = 'finance_accounts_v3';
const BUDGET_STORAGE_KEY = 'finance_budget_v1';
const REMINDER_STORAGE_KEY = 'finance_reminders_v1';
const ESSENTIAL_PLAN_STORAGE_KEY = 'finance_essentials_v1';
const SUPPORT_PLAN_STORAGE_KEY = 'finance_support_v1';
const SUPPORT_SOURCE_STORAGE_KEY = 'finance_support_sources_v1';
const BACKUP_STORAGE_KEY = 'personal_ledger_backup_v1';

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [accounts, setAccounts] = useState<AccountData[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return normalizeAccounts(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load accounts from localStorage', e);
        }
        return createStarterAccounts();
    });

    const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(() => {
        try {
            const saved = localStorage.getItem('finance_rates_v2');
            if (saved) return normalizeExchangeRates(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load rates from localStorage', e);
        }
        return normalizeExchangeRates(DEFAULT_RATES);
    });

    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
        try {
            const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
            if (saved) return normalizeBudgetItems(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load budget items from localStorage', e);
        }
        return [];
    });

    const [reminders, setReminders] = useState<ReminderItem[]>(() => {
        try {
            const saved = localStorage.getItem(REMINDER_STORAGE_KEY);
            if (saved) return normalizeReminders(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load reminders from localStorage', e);
        }
        return [];
    });

    const [essentialPlans, setEssentialPlans] = useState<EssentialPlan[]>(() => {
        try {
            const saved = localStorage.getItem(ESSENTIAL_PLAN_STORAGE_KEY);
            if (saved) return normalizeEssentialPlans(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load essential plans from localStorage', e);
        }
        return STARTER_ESSENTIAL_PLANS.map(plan => ({ ...plan }));
    });

    const [supportPlans, setSupportPlans] = useState<SupportPlan[]>(() => {
        try {
            const saved = localStorage.getItem(SUPPORT_PLAN_STORAGE_KEY);
            if (saved) return normalizeSupportPlans(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load support plans from localStorage', e);
        }
        return DEFAULT_SUPPORT_PLANS;
    });

    const [supportSources, setSupportSources] = useState<SupportSource[]>(() => {
        try {
            const saved = localStorage.getItem(SUPPORT_SOURCE_STORAGE_KEY);
            if (saved) return normalizeSupportSources(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load support sources from localStorage', e);
        }
        return STARTER_SUPPORT_SOURCES.map(source => ({ ...source }));
    });

    const [hasBackupData, setHasBackupData] = useState(() => {
        try {
            return Boolean(localStorage.getItem(BACKUP_STORAGE_KEY));
        } catch {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }, [accounts]);

    useEffect(() => {
        localStorage.setItem('finance_rates_v2', JSON.stringify(exchangeRates));
    }, [exchangeRates]);

    useEffect(() => {
        localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetItems));
    }, [budgetItems]);

    useEffect(() => {
        localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
    }, [reminders]);

    useEffect(() => {
        localStorage.setItem(ESSENTIAL_PLAN_STORAGE_KEY, JSON.stringify(essentialPlans));
    }, [essentialPlans]);

    useEffect(() => {
        localStorage.setItem(SUPPORT_PLAN_STORAGE_KEY, JSON.stringify(supportPlans));
    }, [supportPlans]);

    useEffect(() => {
        localStorage.setItem(SUPPORT_SOURCE_STORAGE_KEY, JSON.stringify(supportSources));
    }, [supportSources]);

    const toUSD = useCallback((balance: number, currency: Currency): number => {
        if (currency === 'USD') return balance;
        const rate = exchangeRates[currency as keyof ExchangeRates];
        return rate ? balance / rate : balance;
    }, [exchangeRates]);

    // Calculate total USD value for a single account (including subBalances)
    const accountTotalUSD = useCallback((account: AccountData): number => {
        let total = toUSD(account.balance, account.currency);
        if (account.subBalances) {
            for (const sb of account.subBalances) {
                total += toUSD(sb.balance, sb.currency);
            }
        }
        return total;
    }, [toUSD]);

    const totalUSD = useMemo(() =>
        accounts.reduce((sum, acc) => sum + accountTotalUSD(acc), 0),
        [accounts, accountTotalUSD]
    );

    const addAccount = (account: Omit<AccountData, 'id'>): string => {
        const id = `acc_${Date.now()}`;
        setAccounts(prev => [...prev, { ...account, id }]);
        return id;
    };

    const deleteAccount = (id: string) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    const updateAccount = (id: string, updates: Partial<AccountData>) => {
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
    };

    const updateSubBalance = (accountId: string, currency: Currency, newBalance: number) => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id !== accountId || !acc.subBalances) return acc;
            return {
                ...acc,
                subBalances: acc.subBalances.map(sb =>
                    sb.currency === currency ? { ...sb, balance: newBalance } : sb
                ),
            };
        }));
    };

    const addSubBalance = (accountId: string, currency: Currency, initialBalance = 0) => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id !== accountId) return acc;
            if (acc.currency === currency) return acc;
            if (acc.subBalances?.some(sb => sb.currency === currency)) return acc;

            const nextSubBalances = [...(acc.subBalances ?? []), { currency, balance: initialBalance }]
                .sort((a, b) => a.currency.localeCompare(b.currency));

            return {
                ...acc,
                subBalances: nextSubBalances,
            };
        }));
    };

    const deleteSubBalance = (accountId: string, currency: Currency) => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id !== accountId || !acc.subBalances) return acc;

            return {
                ...acc,
                subBalances: acc.subBalances.filter(subBalance => subBalance.currency !== currency),
            };
        }));
    };

    const resetToStarterData = () => {
        try {
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify({
                accounts,
                exchangeRates,
                budgetItems,
                reminders,
                essentialPlans,
                supportPlans,
                supportSources,
            }));
            setHasBackupData(true);
        } catch (error) {
            console.error('Failed to backup current local data', error);
        }

        setAccounts(createStarterAccounts());
        setExchangeRates(normalizeExchangeRates(DEFAULT_RATES));
        setBudgetItems([]);
        setReminders([]);
        setEssentialPlans(STARTER_ESSENTIAL_PLANS.map(plan => ({ ...plan })));
        setSupportPlans(DEFAULT_SUPPORT_PLANS.map(plan => ({ ...plan })));
        setSupportSources(STARTER_SUPPORT_SOURCES.map(source => ({ ...source })));
    };

    const restoreBackupData = () => {
        try {
            const saved = localStorage.getItem(BACKUP_STORAGE_KEY);
            if (!saved) return;

            const backup = JSON.parse(saved) as {
                accounts?: AccountData[];
                exchangeRates?: Partial<ExchangeRates>;
                budgetItems?: unknown;
                reminders?: unknown;
                essentialPlans?: unknown;
                supportPlans?: unknown;
                supportSources?: unknown;
            };

            setAccounts(normalizeAccounts(backup.accounts ?? createStarterAccounts()));
            setExchangeRates(normalizeExchangeRates(backup.exchangeRates));
            setBudgetItems(normalizeBudgetItems(backup.budgetItems));
            setReminders(normalizeReminders(backup.reminders));
            setEssentialPlans(normalizeEssentialPlans(backup.essentialPlans));
            setSupportPlans(normalizeSupportPlans(backup.supportPlans));
            setSupportSources(normalizeSupportSources(backup.supportSources));
            localStorage.removeItem(BACKUP_STORAGE_KEY);
            setHasBackupData(false);
        } catch (error) {
            console.error('Failed to restore backup data', error);
        }
    };

    const updateExchangeRates = (rates: Partial<ExchangeRates>) => {
        setExchangeRates(prev => ({ ...prev, ...rates }));
    };

    const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
        const id = `budget_${Date.now()}`;
        setBudgetItems(prev => [...prev, { ...item, id }]);
        return id;
    };

    const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
        setBudgetItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const deleteBudgetItem = (id: string) => {
        setBudgetItems(prev => prev.filter(item => item.id !== id));
    };

    const addReminder = (item: Omit<ReminderItem, 'id'>) => {
        const id = `reminder_${Date.now()}`;
        setReminders(prev => [...prev, { ...item, id }]);
        return id;
    };

    const updateReminder = (id: string, updates: Partial<ReminderItem>) => {
        setReminders(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const deleteReminder = (id: string) => {
        setReminders(prev => prev.filter(item => item.id !== id));
    };

    const completeReminder = (id: string) => {
        setReminders(prev => prev.map(item => {
            if (item.id !== id) return item;

            if (item.frequency === 'monthly') {
                return {
                    ...item,
                    dueDate: advanceMonthlyDueDate(item.dueDate),
                    doneAt: undefined,
                };
            }

            if (item.frequency === 'yearly') {
                return {
                    ...item,
                    dueDate: advanceYearlyDueDate(item.dueDate),
                    doneAt: undefined,
                };
            }

            return {
                ...item,
                doneAt: new Date().toISOString(),
            };
        }));
    };

    const updateEssentialPlan = (key: EssentialPlanKey, updates: Partial<EssentialPlan>) => {
        setEssentialPlans(prev => prev.map(plan => plan.key === key ? { ...plan, ...updates } : plan));
    };

    const updateSupportPlan = (key: SupportPlanKey, updates: Partial<SupportPlan>) => {
        setSupportPlans(prev => prev.map(plan => plan.key === key ? { ...plan, ...updates } : plan));
    };

    const addSupportSource = (item?: Partial<Omit<SupportSource, 'id'>>) => {
        const id = `support_${Date.now()}`;
        setSupportSources(prev => [
            ...prev,
            {
                id,
                label: item?.label?.trim() || '固定转入',
                amount: Number(item?.amount) || 0,
                currency: item?.currency && ['AUD', 'CNY', 'USD', 'MYR', 'SGD', 'HKD'].includes(item.currency) ? item.currency : 'CNY',
                dueDay: Number(item?.dueDay) || 1,
                accountId: item?.accountId,
            },
        ]);
        return id;
    };

    const updateSupportSource = (id: string, updates: Partial<SupportSource>) => {
        setSupportSources(prev => prev.map(source => source.id === id ? { ...source, ...updates } : source));
    };

    const deleteSupportSource = (id: string) => {
        setSupportSources(prev => {
            if (prev.length <= 1) {
                return prev.map(source => source.id === id ? { ...source, amount: 0, label: '固定转入', currency: 'AUD', dueDay: 1, accountId: undefined } : source);
            }
            return prev.filter(source => source.id !== id);
        });
    };

    return (
        <DataContext.Provider
            value={{
                accounts,
                exchangeRates,
                totalUSD,
                budgetItems,
                reminders,
                essentialPlans,
                supportPlans,
                supportSources,
                toUSD,
                accountTotalUSD,
                addAccount,
                deleteAccount,
                updateAccount,
                updateSubBalance,
                addSubBalance,
                deleteSubBalance,
                resetToStarterData,
                restoreBackupData,
                hasBackupData,
                updateExchangeRates,
                addBudgetItem,
                updateBudgetItem,
                deleteBudgetItem,
                addReminder,
                updateReminder,
                deleteReminder,
                completeReminder,
                updateEssentialPlan,
                updateSupportPlan,
                addSupportSource,
                updateSupportSource,
                deleteSupportSource,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
