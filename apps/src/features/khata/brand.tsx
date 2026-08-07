import { Image, StyleSheet } from 'react-native';

export const KHATA_LOGO = require('../../../assets/khata-logo.png');

export function KhataLogo({ size = 44 }: { size?: number }) {
  return <Image accessibilityLabel="Khata logo" source={KHATA_LOGO} style={[styles.logo, { width: size, height: size, borderRadius: size * 0.22 }]} />;
}

const styles = StyleSheet.create({
  logo: { backgroundColor: '#6E2612' },
});
