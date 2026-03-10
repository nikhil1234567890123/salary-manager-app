export type ThemeId =
    | 'gamified'
    | 'pinkFinance'
    | 'liquidGlass'
    | 'minimalProfessional'
    | 'luxuryGold';

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    textInverse: string;
    icon: string;
    border: string;
    success: string;
    danger: string;
    warning: string;
    accent: string;
    surface: string;
    tabBar: string;
    tabIconDefault: string;
    tabIconSelected: string;
    // Glassmorphism specific
    glassOverlay?: string;
    glassBorder?: string;
}

export interface ThemeTypography {
    fontFamilyRegular: string;
    fontFamilyMedium: string;
    fontFamilyBold: string;
    fontFamilyLight?: string;
}

export interface ThemeLayout {
    cardBorderRadius: number;
    buttonBorderRadius: number;
    inputBorderRadius: number;
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
}

export interface ThemeEffects {
    shadowColor: string;
    shadowOpacity: number;
    shadowOffset: { width: number; height: number };
    shadowRadius: number;
    elevation: number;
    isGlassmorphism?: boolean;
}

export interface AppTheme {
    id: ThemeId;
    name: string;
    description: string;
    isDark: boolean;
    colors: ThemeColors;
    typography: ThemeTypography;
    layout: ThemeLayout;
    effects: ThemeEffects;
}
