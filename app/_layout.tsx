import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { BookmarksProvider } from '@/contexts/BookmarksContext';
import { useTheme } from '@/contexts/theme';
import { useDailyNotification } from '@/hooks/useDailyNotification';

function RootShell() {
  useFrameworkReady();
  const { settings } = useSettings();
  const theme = useTheme();
  useDailyNotification();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={settings.darkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <BookmarksProvider>
        <RootShell />
      </BookmarksProvider>
    </SettingsProvider>
  );
}
