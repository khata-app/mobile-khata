import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FocusAwareStatusBar, Pressable, SafeAreaView, Text, View } from '@/components/ui';

const reports = [
  ['📒', 'Day book', 'Every sale, purchase and payment'], ['⚖️', 'Trial balance', 'Debit and credit totals'],
  ['📈', 'Profit & loss', 'Income and expenses for the period'], ['🏦', 'Balance sheet', 'What your business owns and owes'],
  ['🧾', 'VAT summary', 'Taxable sales and purchases'], ['📦', 'Stock report', 'Quantity, value and low-stock items'],
];

export function ReportsScreen() {
  return <SafeAreaView className="flex-1 bg-slate-50"><FocusAwareStatusBar /><ScrollView contentContainerClassName="mx-auto w-full max-w-5xl px-5 pb-10">
    <View className="py-6"><Text className="text-3xl font-bold text-slate-950">Reports</Text><Text className="mt-1 text-slate-500">Mero Kirana पसल · FY 2082/83</Text></View>
    <View className="rounded-3xl bg-[#123B35] p-5"><Text className="text-sm font-medium text-emerald-100">This month</Text><View className="mt-3 flex-row justify-between"><View><Text className="text-2xl font-bold text-white">रु 1,12,300</Text><Text className="mt-1 text-xs text-emerald-100">Net profit</Text></View><View><Text className="text-2xl font-bold text-white">रु 2,48,500</Text><Text className="mt-1 text-xs text-emerald-100">Revenue</Text></View></View></View>
    <Text className="mb-3 mt-8 text-xl font-bold text-slate-900">Financial reports</Text><View className="flex-row flex-wrap justify-between gap-y-3">{reports.map(([icon, title, description]) => <Pressable key={title} onPress={() => router.push('/reports')} className="w-[48%] rounded-2xl bg-white p-4"><Text className="text-2xl">{icon}</Text><Text className="mt-3 font-bold text-slate-900">{title}</Text><Text className="mt-1 text-xs leading-5 text-slate-500">{description}</Text><Text className="mt-3 text-xs font-bold text-emerald-700">Open report →</Text></Pressable>)}</View>
    <Pressable onPress={() => router.push('/reports')} className="mt-6 items-center rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><Text className="font-bold text-emerald-800">Export reports</Text><Text className="mt-1 text-xs text-emerald-700">CSV, PDF and JSON exports</Text></Pressable>
  </ScrollView></SafeAreaView>;
}
export default ReportsScreen;
