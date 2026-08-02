import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FocusAwareStatusBar, Pressable, SafeAreaView, Text, View } from '@/components/ui';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';

const items = [['🏪', 'Business profile', 'Mero Kirana पसल · PAN and contact details'], ['👥', 'Team & permissions', 'Members, invitations and roles'], ['🔄', 'Sync & offline data', 'Queued changes and last sync status'], ['📅', 'Fiscal year', 'BS 2082/83 · Kathmandu timezone'], ['🌐', 'Language & appearance', 'Nepali, English and theme preferences']];

export function SettingsScreen() {
  const signOut = useAuth.use.signOut();
  return <SafeAreaView className="flex-1 bg-slate-50"><FocusAwareStatusBar /><ScrollView contentContainerClassName="mx-auto w-full max-w-5xl px-5 pb-10"><View className="py-6"><Text className="text-3xl font-bold text-slate-950">Settings</Text><Text className="mt-1 text-slate-500">Manage your business and Khata preferences</Text></View>{items.map(([icon, title, detail]) => <Pressable key={title} onPress={() => router.push('/settings')} className="mt-3 rounded-2xl bg-white p-4"><Text className="text-2xl">{icon}</Text><Text className="mt-2 font-bold text-slate-900">{title}</Text><Text className="mt-1 text-xs text-slate-500">{detail}</Text><Text className="mt-3 text-xs font-bold text-emerald-700">Manage →</Text></Pressable>)}<Pressable className="mt-8 rounded-2xl bg-red-50 p-4" onPress={signOut}><Text className="font-bold text-red-700">Sign out</Text><Text className="mt-1 text-xs text-red-600">End this session on this device</Text></Pressable></ScrollView></SafeAreaView>;
}
export default SettingsScreen;
