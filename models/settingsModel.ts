export type ThemeType = 'light' | 'dark' | 'system';

export interface AppSettings {
    isDarkMode: boolean;
    autoExpenseDetection: boolean;
    spendingAlerts: boolean;
    appLockEnabled: boolean;
    offlinePrivacyMode: boolean;
    theme: ThemeType;
}

export const DEFAULT_SETTINGS: AppSettings = {
    isDarkMode: true,
    autoExpenseDetection: true,
    spendingAlerts: true,
    appLockEnabled: false,
    offlinePrivacyMode: false,
    theme: 'dark',
};
