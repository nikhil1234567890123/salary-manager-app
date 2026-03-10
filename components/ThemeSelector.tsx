import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/store/settingsStore';
import { themes, themeOptions } from '@/themes';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ThemeSelector() {
    const { settings, setTheme } = useSettings();
    const appTheme = useAppTheme();
    const activeThemeId = settings.activeThemeId || 'luxuryGold';

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: appTheme.colors.textSecondary }]}>APP THEME</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {themeOptions.map((theme) => {
                    const isActive = theme.id === activeThemeId;

                    return (
                        <TouchableOpacity
                            key={theme.id}
                            style={[
                                styles.themeCard,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                                    borderWidth: isActive ? 2 : 1
                                }
                            ]}
                            onPress={() => setTheme(theme.id)}
                            activeOpacity={0.8}
                        >
                            {/* Color preview circles */}
                            <View style={styles.previewContainer}>
                                <View style={[styles.colorCircle, { backgroundColor: theme.colors.background }]} />
                                <View style={[styles.colorCircle, { backgroundColor: theme.colors.primary, marginLeft: -10 }]} />
                                <View style={[styles.colorCircle, { backgroundColor: theme.colors.success, marginLeft: -10 }]} />
                            </View>

                            <Text style={[styles.themeName, { color: theme.colors.text }]} numberOfLines={1}>
                                {theme.name}
                            </Text>

                            {isActive && (
                                <View style={[styles.activeCheck, { backgroundColor: theme.colors.primary }]}>
                                    <Ionicons name="checkmark" size={12} color={theme.colors.background} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    scrollContent: {
        paddingRight: 20,
        gap: 12,
    },
    themeCard: {
        width: 130,
        padding: 16,
        borderRadius: 20,
        position: 'relative',
        alignItems: 'flex-start',
    },
    previewContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    colorCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    themeName: {
        fontSize: 14,
        fontWeight: '700',
    },
    activeCheck: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
