import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';

type Props = { hidden?: boolean };
export function FocusAwareStatusBar({ hidden = false }: Props) {
  const isFocused = useIsFocused();
  const theme = useColorScheme();

  if (Platform.OS === 'web')
    return null;

  return isFocused
    ? (
        <SystemBars
          style={theme !== 'dark' ? 'dark' : 'light'}
          hidden={hidden}
        />
      )
    : null;
}
