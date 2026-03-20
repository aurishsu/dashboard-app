import { createContext } from 'react';
import type { AccountData, Currency, ExchangeRates } from '../types/data';
import type { BudgetItem, EssentialPlan, EssentialPlanKey, ReminderItem, SupportPlan, SupportPlanKey, SupportSource } from '../types/planner';

export interface DataContextType {
    accounts: AccountData[];
    exchangeRates: ExchangeRates;
    totalUSD: number;
    budgetItems: BudgetItem[];
    reminders: ReminderItem[];
    essentialPlans: EssentialPlan[];
    supportPlans: SupportPlan[];
    supportSources: SupportSource[];
    toUSD: (balance: number, currency: Currency) => number;
    accountTotalUSD: (account: AccountData) => number;
    addAccount: (account: Omit<AccountData, 'id'>) => string;
    deleteAccount: (id: string) => void;
    updateAccount: (id: string, updates: Partial<AccountData>) => void;
    updateSubBalance: (accountId: string, currency: Currency, newBalance: number) => void;
    addSubBalance: (accountId: string, currency: Currency, initialBalance?: number) => void;
    deleteSubBalance: (accountId: string, currency: Currency) => void;
    resetToStarterData: () => void;
    loadDemoWorkspace: () => void;
    restoreBackupData: () => void;
    hasBackupData: boolean;
    updateExchangeRates: (rates: Partial<ExchangeRates>) => void;
    addBudgetItem: (item: Omit<BudgetItem, 'id'>) => string;
    updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
    deleteBudgetItem: (id: string) => void;
    addReminder: (item: Omit<ReminderItem, 'id'>) => string;
    updateReminder: (id: string, updates: Partial<ReminderItem>) => void;
    deleteReminder: (id: string) => void;
    completeReminder: (id: string) => void;
    updateEssentialPlan: (key: EssentialPlanKey, updates: Partial<EssentialPlan>) => void;
    updateSupportPlan: (key: SupportPlanKey, updates: Partial<SupportPlan>) => void;
    addSupportSource: (item?: Partial<Omit<SupportSource, 'id'>>) => string;
    updateSupportSource: (id: string, updates: Partial<SupportSource>) => void;
    deleteSupportSource: (id: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);
