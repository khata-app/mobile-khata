import { Redirect, SplashScreen, Stack } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';

import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';

export default function AppLayout() {
  const status = useAuth.use.status();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        hideSplash();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hideSplash, status]);

  if (status === 'idle') return null;
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="dashboard" />
    <Stack.Screen name="reports" />
    <Stack.Screen name="settings" />
  </Stack>;
}
