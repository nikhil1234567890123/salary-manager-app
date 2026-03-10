import { useSettings } from '../store/settingsStore';
import { themes } from '../themes';
import { AppTheme } from '../types/theme';

export function useAppTheme(): AppTheme {
    const { settings } = useSettings();

    // Safe fallback to luxuryGold if activeThemeId is missing
    const activeThemeId = settings.activeThemeId || 'luxuryGold';

    return themes[activeThemeId] || themes.luxuryGold;
}
