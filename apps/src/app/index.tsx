import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { LandingScreen } from '@/features/landing/landing-screen';

export default function IndexRoute() {
  return Platform.OS === 'web' ? <LandingScreen /> : <Redirect href="/login" />;
}
