import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, DEFAULT_SETTINGS, ThemeType } from '../models/settingsModel';
import { SettingsService } from '../services/settingsService';

interface SettingsContextType {
    settings: AppSettings;
    isLoading: boolean;
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
    toggleTheme: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const loadedSettings = await SettingsService.loadSettings();
            setSettings(loadedSettings);
            setIsLoading(false);
        })();
    }, []);

    const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        const newSettings = await SettingsService.updateSetting(key, value);
        setSettings(newSettings);
    };

    const toggleTheme = async () => {
        const newIsDarkMode = !settings.isDarkMode;
        const newTheme: ThemeType = newIsDarkMode ? 'dark' : 'light';

        const currentSettings = await SettingsService.loadSettings();
        const newSettings = { ...currentSettings, isDarkMode: newIsDarkMode, theme: newTheme };
        await SettingsService.saveSettings(newSettings);
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, isLoading, updateSetting, toggleTheme }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
