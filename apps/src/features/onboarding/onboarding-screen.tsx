import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';
import { Cover } from './components/cover';

export function OnboardingScreen() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  return (
    <View className="flex h-full items-center justify-center">
      <FocusAwareStatusBar />
      <View className="w-full flex-1">
        <Cover />
      </View>
      <View className="justify-end">
        <Text className="my-3 text-center text-5xl font-bold">
          Khata मा स्वागत छ
        </Text>
        <Text className="mb-2 text-center text-lg text-gray-600">
          Your simple, offline-first business ledger
        </Text>

        <Text className="my-1 pt-6 text-left text-lg">
          📒 Sales, purchases and expenses in one place
          {' '}
        </Text>
        <Text className="my-1 text-left text-lg">
          📊 Know your cash, profit and stock at a glance
        </Text>
        <Text className="my-1 text-left text-lg">
          🔒 Your business data stays private and secure
        </Text>
        <Text className="my-1 text-left text-lg">
          ⚡ Works offline and syncs when you reconnect
        </Text>
      </View>
      <SafeAreaView className="mt-6">
        <Button
          label="Get started with Khata "
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/login');
          }}
        />
      </SafeAreaView>
    </View>
  );
}
