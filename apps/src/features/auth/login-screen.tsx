import type { LoginFormProps } from './components/login-form';
import { useRouter } from 'expo-router';

import * as React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FocusAwareStatusBar } from '@/components/ui';
import { C } from '@/features/khata/ui';
import { loadWorkspace } from '@/lib/supabase-repository';
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
    const workspace = await loadWorkspace();
    router.replace(workspace ? '/dashboard' : '/company');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} mode={mode} onModeChange={setMode} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
});
