import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

// Suppress Expo Go push notification warning in SDK 54
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FinanceProvider } from '@/context/FinanceContext';
import { SettingsProvider, useSettings } from '@/store/settingsStore';
import { requestNotificationPermission } from '@/services/notificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { settings, isLoading } = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

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
    <ThemeProvider value={settings.isDarkMode ? DarkTheme : DefaultTheme}>
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

