import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/use-auth-store';

export default function IndexRoute() {
  const status = useAuthStore.use.status();
  if (status === 'idle')
    return null;
  return <Redirect href={status === 'signIn' ? '/dashboard' : '/login'} />;
}
