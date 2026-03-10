import { AppTheme, ThemeId } from '../types/theme';
import { gamifiedTheme } from './gamifiedTheme';
import { pinkFinanceTheme } from './pinkFinanceTheme';
import { liquidGlassTheme } from './glassTheme';
import { minimalProfessionalTheme } from './minimalTheme';
import { luxuryGoldTheme } from './luxuryGoldTheme';

export const themes: Record<ThemeId, AppTheme> = {
    gamified: gamifiedTheme,
    pinkFinance: pinkFinanceTheme,
    liquidGlass: liquidGlassTheme,
    minimalProfessional: minimalProfessionalTheme,
    luxuryGold: luxuryGoldTheme,
};

export const themeOptions = Object.values(themes);

export {
    gamifiedTheme,
    pinkFinanceTheme,
    liquidGlassTheme,
    minimalProfessionalTheme,
    luxuryGoldTheme
};
