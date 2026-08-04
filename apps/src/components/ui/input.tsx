/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { TextInputProps } from 'react-native';
import * as React from 'react';
import { I18nManager, TextInput as NTextInput, StyleSheet, View } from 'react-native';
import { tv } from 'tailwind-variants';

import colors from './colors';
import { Text } from './text';

const inputTv = tv({
  slots: {
    container: 'mb-2',
    label: 'mb-1 text-xs text-[#8A7257]',
    input:
      'font-inter mt-0 rounded-xl border border-[#DCC9A8] bg-white px-4 py-3 text-sm font-medium text-[#2C2115]',
    leftIconSlot: 'absolute left-3 top-3 z-10',
    rightIconSlot: 'absolute right-3 top-3 z-10',
  },

  variants: {
    focused: {
      true: {
        input: 'border-neutral-400 dark:border-neutral-300',
      },
    },
    error: {
      true: {
        input: 'border-danger-600',
        label: 'text-danger-600 dark:text-danger-600',
      },
    },
    disabled: {
      true: {
        input: 'bg-neutral-200',
      },
    },
    leftIcon: {
      true: { input: 'pl-10' },
    },
    rightIcon: {
      true: { input: 'pr-10' },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
    leftIcon: false,
    rightIcon: false,
  },
});

export type NInputProps = {
  label?: string;
  disabled?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & TextInputProps;

export function Input({ ref, ...props }: NInputProps & { ref?: React.Ref<NTextInput | null> }) {
  const { label, error, testID, leftIcon, rightIcon, onBlur: onBlurProp, onFocus: onFocusProp, ...inputProps } = props;
  const [isFocussed, setIsFocussed] = React.useState(false);

  const onBlur = React.useCallback(
    (e: any) => {
      setIsFocussed(false);
      onBlurProp?.(e);
    },
    [onBlurProp],
  );

  const onFocus = React.useCallback(
    (e: any) => {
      setIsFocussed(true);
      onFocusProp?.(e);
    },
    [onFocusProp],
  );

  const styles = inputTv({
    error: Boolean(error),
    focused: isFocussed,
    disabled: Boolean(props.disabled),
    leftIcon: Boolean(leftIcon),
    rightIcon: Boolean(rightIcon),
  });

  return (
    <View className={styles.container()}>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={styles.label()}
        >
          {label}
        </Text>
      )}
      <View className="relative">
        {leftIcon && <View className={styles.leftIconSlot()}>{leftIcon}</View>}
        <NTextInput
          testID={testID}
          ref={ref}
          placeholderTextColor={colors.neutral[400]}
          className={styles.input()}
          onBlur={onBlur}
          onFocus={onFocus}
          {...inputProps}
          style={StyleSheet.flatten([
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            inputProps.style,
          ])}
        />
        {rightIcon && <View className={styles.rightIconSlot()}>{rightIcon}</View>}
      </View>
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="text-sm text-danger-400 dark:text-danger-600"
        >
          {error}
        </Text>
      )}
    </View>
  );
}
