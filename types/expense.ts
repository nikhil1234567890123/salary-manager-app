export interface Expense {
    id: string;
    user_id: string;
    amount: number;
    category: string;
    date: string;
    description?: string;
    created_at: string;
}

export interface CreateExpenseDto {
    amount: number;
    category: string;
    date: string;
    description?: string;
}
