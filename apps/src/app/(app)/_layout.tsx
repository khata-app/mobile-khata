import { Redirect, Stack } from 'expo-router';

import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';

export default function AppLayout() {
  const status = useAuth.use.status();

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
