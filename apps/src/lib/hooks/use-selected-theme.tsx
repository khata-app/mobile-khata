import * as React from 'react';
import { storage } from '../storage';

const SELECTED_THEME = 'SELECTED_THEME';
export type ColorSchemeType = 'light' | 'dark' | 'system';
/**
 * this hooks should only be used while selecting the theme
 * This hooks will return the selected theme which is stored in MMKV
 * selectedTheme should be one of the following values 'light', 'dark' or 'system'
 * don't use this hooks if you want to use it to style your component based on the theme use useUniwind from uniwind instead
 *
 */
export function useSelectedTheme() {
  const [theme, setTheme] = React.useState<ColorSchemeType>('system');

  React.useEffect(() => {
    const stored = storage.getString(SELECTED_THEME) as ColorSchemeType | undefined;
    if (stored === 'light' || stored === 'dark' || stored === 'system') setTheme(stored);
  }, []);

  const setSelectedTheme = React.useCallback(
    (t: ColorSchemeType) => {
      setTheme(t);
      if (typeof window !== 'undefined') {
        storage.set(SELECTED_THEME, t);
      }
    },
    [],
  );

  return { selectedTheme: theme, setSelectedTheme } as const;
}
// to be used in the root file to load the selected theme from MMKV
export function loadSelectedTheme() {
  if (typeof window === 'undefined') return;
  const theme = storage.getString(SELECTED_THEME);
  if (theme !== undefined) {
    storage.set(SELECTED_THEME, theme as ColorSchemeType);
  }
}
