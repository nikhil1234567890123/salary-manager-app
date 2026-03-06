import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
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
import { PermissionService } from '@/services/permissionService';
import { useExpenseDetection } from '@/hooks/useExpenseDetection';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { settings, isLoading } = useSettings();
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
      if (!isLoading) {
        if (settings.appLockEnabled) {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();

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
        setIsAuthenticating(false);
      }
    }

    // Slight delay to ensure smooth transition
    setTimeout(() => {
      authenticate();
    }, 100);
  }, [isLoading, settings.appLockEnabled]);

  if (isLoading || isAuthenticating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: settings?.isDarkMode ? '#2C2B29' : '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#D3A77A" />
      </View>
    );
  }

  // If locked and not authenticated, show blank background
  if (settings.appLockEnabled && !isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: settings.isDarkMode ? '#2C2B29' : '#FFFFFF' }} />
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={settings.isDarkMode ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: '#2C2B29',
          card: '#2C2B29',
        }
      } : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="salary-setup" options={{ headerShown: false }} />
          <Stack.Screen name="(guest)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-expense" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
        <StatusBar style={settings.isDarkMode ? "light" : "dark"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <FinanceProvider>
        <RootLayoutNav />
      </FinanceProvider>
    </SettingsProvider>
  );
}

