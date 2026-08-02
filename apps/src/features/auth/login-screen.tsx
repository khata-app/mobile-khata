import type { LoginFormProps } from './components/login-form';
import { useRouter } from 'expo-router';

import * as React from 'react';
import { FocusAwareStatusBar } from '@/components/ui';
import { LoginForm } from './components/login-form';
import { useAuthStore } from './use-auth-store';

export function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    const { supabase } = await import('@/lib/supabase');
    const result = mode === 'register'
      ? await supabase.auth.signUp({ email: data.email, password: data.password, options: { data: { display_name: data.name } } })
      : await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    const { error } = result;
    if (error) throw error;
    router.replace('/');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} mode={mode} onModeChange={setMode} />
    </>
  );
}
