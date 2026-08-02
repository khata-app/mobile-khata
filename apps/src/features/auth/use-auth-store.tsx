import { create } from 'zustand';
import { createSelectors } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  status: 'idle' | 'signOut' | 'signIn';
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const _useAuthStore = create<AuthState>(set => ({
  status: 'idle',
  session: null,
  signOut: async () => {
    await supabase.auth.signOut();
    set({ status: 'signOut', session: null });
  },
  hydrate: async () => {
    const { data } = await supabase.auth.getSession();
    set({ status: data.session ? 'signIn' : 'signOut', session: data.session });
  },
}));

export const useAuthStore = createSelectors(_useAuthStore);

export const signOut = () => _useAuthStore.getState().signOut();
export const hydrateAuth = () => _useAuthStore.getState().hydrate();

supabase.auth.onAuthStateChange((_event, session) => {
  _useAuthStore.setState({ status: session ? 'signIn' : 'signOut', session });
});
