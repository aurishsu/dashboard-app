import type { ExchangeRates, Currency } from '../types/data';
import type { BudgetItem, EssentialPlan, ReminderItem } from '../types/planner';

export interface BudgetSummary {
    plannedExpenseAud: number;
    actualExpenseAud: number;
    plannedIncomeAud: number;
    actualIncomeAud: number;
    actualTransferAud: number;
    remainingBudgetAud: number;
}

export type ReminderStatus = 'overdue' | 'today' | 'upcoming' | 'done';

export interface EssentialCoverage {
    availableInPlanCurrency: number;
    coverageRatio: number;
    monthsCovered: number;
    canCoverNext: boolean;
}

export function toAUD(amount: number, currency: Currency, exchangeRates: ExchangeRates) {
    if (currency === 'AUD') return amount;
    const usdValue = currency === 'USD' ? amount : amount / exchangeRates[currency];
    return usdValue * exchangeRates.AUD;
}

export function buildBudgetSummary(budgetItems: BudgetItem[], exchangeRates: ExchangeRates): BudgetSummary {
    return budgetItems.reduce<BudgetSummary>((summary, item) => {
        const amountPlanned = toAUD(item.planned, item.currency, exchangeRates);
        const amountActual = toAUD(item.actual, item.currency, exchangeRates);

        if (item.type === 'expense') {
            summary.plannedExpenseAud += amountPlanned;
            summary.actualExpenseAud += amountActual;
        } else if (item.type === 'income') {
            summary.plannedIncomeAud += amountPlanned;
            summary.actualIncomeAud += amountActual;
        } else {
            summary.actualTransferAud += amountActual;
        }

        return summary;
    }, {
        plannedExpenseAud: 0,
        actualExpenseAud: 0,
        plannedIncomeAud: 0,
        actualIncomeAud: 0,
        actualTransferAud: 0,
        remainingBudgetAud: 0,
    });
}

export function finalizeBudgetSummary(summary: BudgetSummary): BudgetSummary {
    return {
        ...summary,
        remainingBudgetAud: summary.plannedExpenseAud - summary.actualExpenseAud,
    };
}

function parseDueDate(dateString: string) {
    return new Date(`${dateString}T12:00:00`);
}

export function fromUSD(amount: number, currency: Currency, exchangeRates: ExchangeRates) {
    if (currency === 'USD') return amount;
    return amount * exchangeRates[currency];
}

export function getDayDiff(dateString: string, baseDate = new Date()) {
    const dueDate = parseDueDate(dateString);
    const current = new Date(baseDate);
    current.setHours(12, 0, 0, 0);
    return Math.round((dueDate.getTime() - current.getTime()) / 86_400_000);
}

export function getReminderStatus(reminder: ReminderItem, baseDate = new Date()): ReminderStatus {
    if (reminder.doneAt) return 'done';

    const dayDiff = getDayDiff(reminder.dueDate, baseDate);
    if (dayDiff < 0) return 'overdue';
    if (dayDiff === 0) return 'today';
    return 'upcoming';
}

export function sortReminders(reminders: ReminderItem[]) {
    return [...reminders].sort((left, right) => {
        const statusOrder: Record<ReminderStatus, number> = { overdue: 0, today: 1, upcoming: 2, done: 3 };
        const leftStatus = getReminderStatus(left);
        const rightStatus = getReminderStatus(right);

        if (statusOrder[leftStatus] !== statusOrder[rightStatus]) {
            return statusOrder[leftStatus] - statusOrder[rightStatus];
        }

        return parseDueDate(left.dueDate).getTime() - parseDueDate(right.dueDate).getTime();
    });
}

export function getUpcomingReminders(reminders: ReminderItem[], limit = 3) {
    return sortReminders(reminders).filter(reminder => !reminder.doneAt).slice(0, limit);
}

export function formatReminderTiming(reminder: ReminderItem, baseDate = new Date()) {
    const dayDiff = getDayDiff(reminder.dueDate, baseDate);
    if (reminder.doneAt) return '已完成';
    if (dayDiff < 0) return `已逾期 ${Math.abs(dayDiff)} 天`;
    if (dayDiff === 0) return '今天到期';
    if (dayDiff === 1) return '明天到期';
    return `${dayDiff} 天后到期`;
}

export function advanceMonthlyDueDate(dueDate: string) {
    const current = parseDueDate(dueDate);
    current.setMonth(current.getMonth() + 1);
    return current.toISOString().slice(0, 10);
}

export function advanceYearlyDueDate(dueDate: string) {
    const current = parseDueDate(dueDate);
    current.setFullYear(current.getFullYear() + 1);
    return current.toISOString().slice(0, 10);
}

export function getNextEssentialDueDate(plan: EssentialPlan, baseDate = new Date()) {
    const current = new Date(baseDate);
    current.setHours(12, 0, 0, 0);

    if (plan.frequency === 'yearly') {
        const dueYear = current.getMonth() + 1 > (plan.dueMonth ?? 1)
            || (current.getMonth() + 1 === (plan.dueMonth ?? 1) && current.getDate() > plan.dueDay)
            ? current.getFullYear() + 1
            : current.getFullYear();

        return new Date(dueYear, (plan.dueMonth ?? 1) - 1, plan.dueDay, 12, 0, 0, 0);
    }

    const thisMonthDue = new Date(current.getFullYear(), current.getMonth(), plan.dueDay, 12, 0, 0, 0);
    if (thisMonthDue.getTime() >= current.getTime()) {
        return thisMonthDue;
    }

    return new Date(current.getFullYear(), current.getMonth() + 1, plan.dueDay, 12, 0, 0, 0);
}

export function formatEssentialDue(plan: EssentialPlan) {
    if (plan.frequency === 'yearly') {
        return `每年 ${plan.dueMonth}/${plan.dueDay}`;
    }

    return `每月 ${plan.dueDay} 日`;
}

export function getEssentialCoverage(plan: EssentialPlan, fundingAccountUSD: number, exchangeRates: ExchangeRates): EssentialCoverage {
    const availableInPlanCurrency = fromUSD(fundingAccountUSD, plan.currency, exchangeRates);
    const coverageRatio = plan.amount > 0 ? availableInPlanCurrency / plan.amount : 0;
    const monthsCovered = plan.frequency === 'monthly' && plan.amount > 0 ? availableInPlanCurrency / plan.amount : 0;

    return {
        availableInPlanCurrency,
        coverageRatio,
        monthsCovered,
        canCoverNext: plan.amount > 0 ? availableInPlanCurrency >= plan.amount : false,
    };
}
