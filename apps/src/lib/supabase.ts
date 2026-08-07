import type { SupabaseClient } from '@supabase/supabase-js';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
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
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
