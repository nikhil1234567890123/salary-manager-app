export interface Salary {
    monthlySalary: number;
    fixedExpenses: number;
    savingsRate: number; // default 0.2 (20%)
}

// In-memory store
let salaryData: Salary | null = null;

export function getSalary(): Salary | null {
    return salaryData;
}

export function setSalary(data: Salary): Salary {
    salaryData = {
        monthlySalary: data.monthlySalary,
        fixedExpenses: data.fixedExpenses,
        savingsRate: data.savingsRate ?? 0.2,
    };
    return salaryData;
}
