import { v4 as uuidv4 } from 'uuid';

export interface Expense {
    id: string;
    amount: number;
    category: string;
    note: string;
    date: string; // ISO date string
}

// In-memory store
const expenses: Expense[] = [];

export function getAllExpenses(): Expense[] {
    return expenses;
}

export function addExpense(data: Omit<Expense, 'id'>): Expense {
    const expense: Expense = {
        id: uuidv4(),
        amount: data.amount,
        category: data.category,
        note: data.note || '',
        date: data.date || new Date().toISOString().split('T')[0],
    };
    expenses.push(expense);
    return expense;
}
