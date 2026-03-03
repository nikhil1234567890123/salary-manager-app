export interface Salary {
    id: string;
    user_id: string;
    amount: number;
    month: string;
    year: number;
    description?: string;
    created_at: string;
}

export interface CreateSalaryDto {
    amount: number;
    month: string;
    year: number;
    description?: string;
}
