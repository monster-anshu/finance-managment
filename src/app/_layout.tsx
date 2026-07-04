import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { MigrationGate } from '@/components/migration-gate';
import { queryClient } from '@/lib/query';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <MigrationGate>
          <AnimatedSplashOverlay />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="instrument/[id]" options={{ title: 'Instrument' }} />
            <Stack.Screen
              name="instrument/new"
              options={{ title: 'New Instrument', presentation: 'modal' }}
            />
            <Stack.Screen
              name="instrument/edit/[id]"
              options={{ title: 'Edit Instrument', presentation: 'modal' }}
            />
            <Stack.Screen
              name="transaction/new"
              options={{ title: 'New Buy', presentation: 'modal' }}
            />
            <Stack.Screen
              name="transaction/edit/[id]"
              options={{ title: 'Edit Buy', presentation: 'modal' }}
            />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          </Stack>
        </MigrationGate>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
