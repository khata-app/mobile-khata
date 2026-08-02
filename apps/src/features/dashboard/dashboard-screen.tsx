import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FocusAwareStatusBar, Pressable, SafeAreaView, Text, View } from '@/components/ui';

const stats = [
  { label: 'Sales this month', value: 'रु 2,48,500', tone: 'bg-emerald-50' },
  { label: 'Purchases', value: 'रु 1,36,200', tone: 'bg-blue-50' },
  { label: 'Receivables', value: 'रु 84,750', tone: 'bg-amber-50' },
  { label: 'Cash & bank', value: 'रु 3,12,400', tone: 'bg-violet-50' },
];
const actions = [
  ['＋', 'New sale', '/reports'],
  ['↙', 'Record purchase', '/reports'],
  ['＋', 'Add expense', '/reports'],
  ['⇄', 'Transfer money', '/reports'],
] as const;

export function DashboardScreen() {
  return <SafeAreaView className="flex-1 bg-slate-50"><FocusAwareStatusBar /><ScrollView contentContainerClassName="mx-auto w-full max-w-5xl px-5 pb-10">
    <View className="flex-row items-center justify-between py-5"><View><Text className="text-sm text-slate-500">Sunday, 2 August 2026</Text><Text className="mt-1 text-3xl font-bold text-slate-950">Namaste, Khata 👋</Text></View><Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white"><Text className="text-xl">🔔</Text></Pressable></View>
    <View className="rounded-3xl bg-[#123B35] p-6"><Text className="text-sm font-medium text-emerald-100">Mero Kirana पसल · FY 2082/83</Text><Text className="mt-3 text-4xl font-bold text-white">रु 1,12,300</Text><Text className="mt-1 text-sm text-emerald-100">Net profit this month</Text><View className="mt-5 flex-row items-center"><View className="rounded-full bg-emerald-400/20 px-3 py-1"><Text className="text-xs font-bold text-emerald-200">↑ 12.4%</Text></View><Text className="ml-3 text-xs text-emerald-100">compared with last month</Text></View></View>
    <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">{stats.map(stat => <View key={stat.label} className={`w-[48%] rounded-2xl p-4 ${stat.tone}`}><Text className="text-xs text-slate-500">{stat.label}</Text><Text className="mt-2 text-lg font-bold text-slate-900">{stat.value}</Text></View>)}</View>
    <Text className="mb-3 mt-8 text-xl font-bold text-slate-900">Quick actions</Text><View className="flex-row flex-wrap justify-between gap-y-3">{actions.map(([icon, label, href]) => <Pressable key={label} onPress={() => router.push(href)} className="w-[48%] flex-row items-center rounded-2xl bg-white p-4"><View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-100"><Text className="text-xl text-emerald-800">{icon}</Text></View><Text className="ml-3 font-semibold text-slate-800">{label}</Text></Pressable>)}</View>
    <View className="mt-8 flex-row items-center justify-between"><Text className="text-xl font-bold text-slate-900">Recent activity</Text><Pressable onPress={() => router.push('/reports')}><Text className="font-semibold text-emerald-700">View all</Text></Pressable></View>
    {[['Sale invoice #1042', 'Today · Cash sale', '+ रु 12,500'], ['Purchase from Bhatbhateni', 'Yesterday · Inventory', '- रु 8,200'], ['Rent payment', '31 Jul · Expense', '- रु 25,000']].map(([title, detail, amount]) => <View key={title} className="mt-3 flex-row items-center rounded-2xl bg-white p-4"><View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Text>▣</Text></View><View className="ml-3 flex-1"><Text className="font-semibold text-slate-800">{title}</Text><Text className="mt-1 text-xs text-slate-500">{detail}</Text></View><Text className={`font-bold ${amount.startsWith('+') ? 'text-emerald-700' : 'text-slate-700'}`}>{amount}</Text></View>)}
  </ScrollView></SafeAreaView>;
}
