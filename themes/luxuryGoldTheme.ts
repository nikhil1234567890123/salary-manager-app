import { AppTheme } from '../types/theme';

export const luxuryGoldTheme: AppTheme = {
    id: 'luxuryGold',
    name: 'Luxury Gold',
    description: 'Deep carbon backgrounds, gold accents, premium UI.',
    isDark: true,
    colors: {
        primary: '#D4AF37', // Shiny gold
        secondary: '#8F7A35', // Darker gold
        background: '#121212', // Carbon/OLED black
        card: '#1E1E1E', // Dark grey cards
        surface: '#252525',
        text: '#FFFFFF',
        textSecondary: '#A0A0A0',
        textInverse: '#000000',
        icon: '#D4AF37',
        border: '#333333',
        success: '#34D399',
        danger: '#F87171',
        warning: '#FBBF24',
        accent: '#F9D776', // Lighter gold accent
        tabBar: '#121212',
        tabIconDefault: '#666666',
        tabIconSelected: '#D4AF37',
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
        shadowColor: '#D4AF37',
        shadowOpacity: 0.1, // Subtle gold glow
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
        isGlassmorphism: false,
    },
};
