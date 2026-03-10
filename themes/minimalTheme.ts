import { AppTheme } from '../types/theme';

export const minimalProfessionalTheme: AppTheme = {
    id: 'minimalProfessional',
    name: 'Minimal Pro',
    description: 'White/gray/black, clean typography, sharp cards.',
    isDark: false,
    colors: {
        primary: '#111111', // Almost black for primary actions
        secondary: '#444444',
        background: '#F0F0F0', // Very light grey
        card: '#FFFFFF',
        surface: '#FAFAFA',
        text: '#111111',
        textSecondary: '#666666',
        textInverse: '#FFFFFF',
        icon: '#222222',
        border: '#E5E5E5',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        accent: '#22C55E', // Green accent used in reference
        tabBar: '#FFFFFF',
        tabIconDefault: '#999999',
        tabIconSelected: '#111111',
    },
    typography: {
        fontFamilyRegular: 'System',
        fontFamilyMedium: 'System',
        fontFamilyBold: 'System',
        fontFamilyLight: 'System',
    },
    layout: {
        cardBorderRadius: 16, // Sharper cards 
        buttonBorderRadius: 100, // Pill shaped buttons are ok, reference shows some pills
        inputBorderRadius: 8, // Very sharp inputs
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
        },
    },
    effects: {
        shadowColor: '#000000',
        shadowOpacity: 0.03, // Very subtle, almost flat
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 1,
        isGlassmorphism: false,
    },
};
