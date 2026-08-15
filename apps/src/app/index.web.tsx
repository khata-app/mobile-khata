import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { LandingScreen } from '@/features/landing/landing-screen';

export default function WebIndexRoute() {
  const status = useAuthStore.use.status();

  if (status === 'signIn') return <Redirect href="/dashboard" />;
  return <LandingScreen />;
}
