import { AppTheme } from '../types/theme';

export const gamifiedTheme: AppTheme = {
    id: 'gamified',
    name: 'Playful & Gamified',
    description: 'Bright colors, heavy shadows, and rounded bubbly UI.',
    isDark: false,
    colors: {
        primary: '#A370F7', // Bright purple for growth/buttons
        secondary: '#FFAA00', // Gold/yellow for badges/XP
        background: '#F0F4F8', // Soft light blue-grey
        card: '#FFFFFF', // Clean white cards
        surface: '#E8EDF2',
        text: '#1C1C1E', // Very dark grey, not pure black
        textSecondary: '#6B7280',
        textInverse: '#FFFFFF',
        icon: '#4B5563',
        border: '#E5E7EB',
        success: '#34D399', // Bright mint green
        danger: '#F87171', // Soft bright red
        warning: '#FBBF24',
        accent: '#38BDF8', // Light blue
        tabBar: '#FFFFFF',
        tabIconDefault: '#9CA3AF',
        tabIconSelected: '#A370F7',
    },
    typography: {
        fontFamilyRegular: 'System', // Will map to correct fonts later
        fontFamilyMedium: 'System',
        fontFamilyBold: 'System',
        fontFamilyLight: 'System',
    },
    layout: {
        cardBorderRadius: 24, // Very rounded cards
        buttonBorderRadius: 100, // Pill shaped buttons
        inputBorderRadius: 16,
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
        },
    },
    effects: {
        shadowColor: '#A370F7',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 5,
        isGlassmorphism: false,
    },
};
