import type { SupabaseClient } from '@supabase/supabase-js';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const isServer = Platform.OS === 'web' && typeof window === 'undefined';

export const isSupabaseConfigured = Boolean(url && publishableKey) && !isServer;

if (!isSupabaseConfigured) {
  console.warn('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
}

const serverClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

export const supabase = isServer
  ? serverClient
  : createClient(url ?? 'https://invalid.local', publishableKey ?? 'missing-key', {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
        lock: processLock,
      },
    });

// Supabase can only refresh an Android/iOS session reliably when it knows
// whether the app is active. Register this once, alongside the singleton client.
if (!isServer && isSupabaseConfigured && Platform.OS !== 'web') {
  if (AppState.currentState === 'active')
    supabase.auth.startAutoRefresh();

  AppState.addEventListener('change', (state) => {
    if (state === 'active')
      supabase.auth.startAutoRefresh();
    else
      supabase.auth.stopAutoRefresh();
  });
}
