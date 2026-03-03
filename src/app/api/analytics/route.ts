import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        if (!month || !year) {
            return NextResponse.json({ success: false, message: 'Month and year are required' }, { status: 400 });
        }

        // Fetch salaries for the month
        const { data: salaries, error: salaryError } = await supabase
            .from('salaries')
            .select('amount')
            .eq('user_id', user.id)
            .eq('month', month)
            .eq('year', parseInt(year));

        if (salaryError) throw salaryError;

        // Fetch expenses for the month
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;

        const { data: expenses, error: expenseError } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .gte('date', startDate)
            .lte('date', endDate);

        if (expenseError) throw expenseError;

        const totalSalary = salaries.reduce((sum, s) => sum + s.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const savings = totalSalary - totalExpense;

        return NextResponse.json({
            success: true,
            message: 'Analytics fetched successfully',
            data: {
                month,
                year,
                totalSalary,
                totalExpense,
                savings
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
