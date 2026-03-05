import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_SETTINGS } from '../models/settingsModel';

const SETTINGS_STORAGE_KEY = '@app_settings';

export const SettingsService = {
    async loadSettings(): Promise<AppSettings> {
        try {
            const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
            if (settingsJson) {
                const parsed = JSON.parse(settingsJson);
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
            return DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Failed to load settings from storage', error);
            return DEFAULT_SETTINGS;
        }
    },

    async saveSettings(settings: AppSettings): Promise<void> {
        try {
            const jsonValue = JSON.stringify(settings);
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, jsonValue);
        } catch (error) {
            console.error('Failed to save settings to storage', error);
        }
    },

    async updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<AppSettings> {
        const currentSettings = await this.loadSettings();
        const newSettings = { ...currentSettings, [key]: value };
        await this.saveSettings(newSettings);
        return newSettings;
    }
};
