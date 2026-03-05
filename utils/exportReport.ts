import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Expense } from '../context/FinanceContext';

export async function exportCSV(expenses: Expense[]): Promise<boolean> {
    try {
        if (expenses.length === 0) {
            alert("No expenses to export.");
            return false;
        }

        const header = 'Date,Category,Note,Amount\n';
        const rows = expenses.map(e =>
            `"${e.date}","${e.category}","${e.note || ''}",${e.amount}`
        ).join('\n');

        const csvContent = header + rows;
        const fileUri = `${FileSystem.documentDirectory || ''}expenses_report.csv`;

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Expenses Report',
                UTI: 'public.comma-separated-values-text'
            });
            return true;
        } else {
            alert("Sharing is not available on this device");
            return false;
        }
    } catch (error) {
        console.error("Failed to export CSV:", error);
        alert("Failed to export report");
        return false;
    }
}
