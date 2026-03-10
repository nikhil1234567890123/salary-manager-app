import { AppTheme } from '../types/theme';

export const liquidGlassTheme: AppTheme = {
    id: 'liquidGlass',
    name: 'Liquid Glass',
    description: 'Blurred backgrounds, translucent cards, neon text.',
    isDark: true,
    colors: {
        primary: '#E0E7FF', // Very light blue for primary text/icons on glass
        secondary: '#818CF8', // Neon blue accents
        background: '#0B0F19', // Deep dark blue background (will have glowing orbs behind it ideally)
        card: 'rgba(255, 255, 255, 0.08)', // Translucent white for glass cards
        surface: 'rgba(255, 255, 255, 0.03)',
        text: '#FFFFFF',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        textInverse: '#0B0F19',
        icon: 'rgba(255, 255, 255, 0.8)',
        border: 'rgba(255, 255, 255, 0.1)', // Subtle glass border
        success: '#34D399',
        danger: '#F87171',
        warning: '#FBBF24',
        accent: '#60A5FA',
        tabBar: 'rgba(11, 15, 25, 0.85)', // Blur tab bar
        tabIconDefault: 'rgba(255, 255, 255, 0.4)',
        tabIconSelected: '#FFFFFF',
        glassOverlay: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.15)',
    },
    typography: {
        fontFamilyRegular: 'System',
        fontFamilyMedium: 'System',
        fontFamilyBold: 'System',
        fontFamilyLight: 'System',
    },
    layout: {
        cardBorderRadius: 28,
        buttonBorderRadius: 16,
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
        shadowColor: '#000000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 5,
        isGlassmorphism: true,
    },
};
