import { AppTheme } from '../types/theme';

export const pinkFinanceTheme: AppTheme = {
    id: 'pinkFinance',
    name: 'Pink Minimal',
    description: 'Soft gradients, clean typography, pink primary accents.',
    isDark: false,
    colors: {
        primary: '#FF4794', // Strong pink
        secondary: '#FFB3D1', // Light pink
        background: '#FDF7F9', // Very soft pinkish white background
        card: '#FFFFFF',
        surface: '#FDF2F6',
        text: '#1F1218',
        textSecondary: '#8B7C84',
        textInverse: '#FFFFFF',
        icon: '#4A3B44',
        border: '#F3E1EA',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        accent: '#FF4794',
        tabBar: '#FFFFFF',
        tabIconDefault: '#C1B6BC',
        tabIconSelected: '#FF4794',
    },
    typography: {
        fontFamilyRegular: 'System',
        fontFamilyMedium: 'System',
        fontFamilyBold: 'System',
        fontFamilyLight: 'System',
    },
    layout: {
        cardBorderRadius: 20,
        buttonBorderRadius: 12,
        inputBorderRadius: 12,
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
        },
    },
    effects: {
        shadowColor: '#FF4794',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 3,
        isGlassmorphism: false,
    },
};
