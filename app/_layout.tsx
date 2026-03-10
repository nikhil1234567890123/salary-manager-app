import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';

// Suppress Expo Go push notification warning in SDK 54
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications'
]);

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FinanceProvider } from '@/context/FinanceContext';
import { SettingsProvider, useSettings } from '@/store/settingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PermissionService } from '@/services/permissionService';
import { useExpenseDetection } from '@/hooks/useExpenseDetection';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { settings, isLoading } = useSettings();
  const theme = useAppTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    // Sequential permission request after a small delay 
    // to ensure screen transition/mount is complete.
    const setupPermissions = async () => {
      try {
        // Slight delay (800ms) prevents Alert/Permission dialog 
        // from appearing mid-transition, which can lead to UI hangs.
        await new Promise(resolve => setTimeout(resolve, 800));
        await PermissionService.requestAllPermissions();
      } catch (e) {
        console.warn('[RootLayout] Permission sequence failed:', e);
      }
    };
    setupPermissions();
  }, []);

  // Activate background SMS/Expense detection
  useExpenseDetection();

  useEffect(() => {
    async function authenticate() {
      console.log('[RootLayoutNav] authenticate called, isLoading:', isLoading);
      if (!isLoading) {
        console.log('[RootLayoutNav] settings.appLockEnabled:', settings.appLockEnabled);
        try {
          if (settings.appLockEnabled) {
            console.log('[RootLayoutNav] checking hardware...');
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            console.log('[RootLayoutNav] hasHardware:', hasHardware);
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            console.log('[RootLayoutNav] isEnrolled:', isEnrolled);

            if (hasHardware && isEnrolled) {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access Salary Manager',
                fallbackLabel: 'Use PIN',
              });
              setIsAuthenticated(result.success);
            } else {
              // Fallback to true if biometrics are not set up on device
              setIsAuthenticated(true);
            }
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('[RootLayoutNav] authentication error:', error);
          setIsAuthenticated(true); // Fallback to let user in if biometrics crash
        } finally {
          console.log('[RootLayoutNav] setting isAuthenticating to false');
          setIsAuthenticating(false);
        }
      }
    }

    // Slight delay to ensure smooth transition
    console.log('[RootLayoutNav] Setting timeout for authenticate');
    setTimeout(() => {
      authenticate();
    }, 100);
  }, [isLoading, settings.appLockEnabled]);

  if (isLoading || isAuthenticating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // If locked and not authenticated, show blank background
  if (settings.appLockEnabled && !isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={{
        dark: theme.isDark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.danger,
        },
        fonts: theme.isDark ? DarkTheme.fonts : DefaultTheme.fonts
      }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="salary-setup" options={{ headerShown: false }} />
          <Stack.Screen name="(guest)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-expense" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <FinanceProvider>
          <RootLayoutNav />
        </FinanceProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

