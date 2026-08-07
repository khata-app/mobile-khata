import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { createSelectors } from '@/lib/utils';

type AuthState = {
  session: Session | null;
  status: 'idle' | 'signOut' | 'signIn';
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const AUTH_HYDRATION_TIMEOUT_MS = 8_000;

async function getSessionWithTimeout() {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Auth session check timed out')), AUTH_HYDRATION_TIMEOUT_MS);
  });

  try {
    return await Promise.race([supabase.auth.getSession(), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

const _useAuthStore = create<AuthState>(set => ({
  status: 'idle',
  session: null,
  signOut: async () => {
    await supabase.auth.signOut();
    set({ status: 'signOut', session: null });
  },
  hydrate: async () => {
    try {
      const { data, error } = await getSessionWithTimeout();
      if (error) {
        set({ status: 'signOut', session: null });
        return;
      }
      set({ status: data.session ? 'signIn' : 'signOut', session: data.session });
    } catch {
      set({ status: 'signOut', session: null });
    }
  },
}));

export const useAuthStore = createSelectors(_useAuthStore);

export const signOut = () => _useAuthStore.getState().signOut();
export const hydrateAuth = () => _useAuthStore.getState().hydrate();

supabase.auth.onAuthStateChange((_event, session) => {
  _useAuthStore.setState({ status: session ? 'signIn' : 'signOut', session });
});
