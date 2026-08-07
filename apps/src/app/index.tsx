import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { LandingScreen } from '@/features/landing/landing-screen';

export default function IndexRoute() {
  const status = useAuthStore.use.status();
  if (Platform.OS === 'web')
    return <LandingScreen />;
  if (status === 'idle')
    return null;
  return <Redirect href={status === 'signIn' ? '/dashboard' : '/login'} />;
}
