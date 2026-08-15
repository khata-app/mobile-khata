import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as z from 'zod';
import { Button, Input } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { C, SERIF, Text, ruledPaper } from '@/features/khata/ui';
import { AlertTriangleIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from '@/features/khata/icons';
import { KhataLogo } from '@/features/khata/brand';

const getErrorMessage = (error: unknown) => {
  if (!error) return 'Something went wrong. Please try again.';
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password. Please try again.';
  if (/already registered/i.test(message)) return 'An account already exists for this email. Please sign in instead.';
  if (/confirm|check your email/i.test(message)) return message;
  if (/rate limit/i.test(message)) return 'Too many attempts. Please wait a moment and try again.';
  if (/network|fetch|failed/i.test(message)) return 'Could not reach the server. Check your connection and try again.';
  return message;
};

const schema = z.object({
  name: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;
export type LoginFormProps = { onSubmit?: (data: FormType) => void | Promise<void>; mode?: 'login' | 'register'; onModeChange?: (mode: 'login' | 'register') => void };

export function LoginForm({ onSubmit = async () => {}, mode = 'login', onModeChange }: LoginFormProps) {
  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    validators: { onChange: schema as any },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await onSubmit(value);
      } catch (error) {
        setFormError(getErrorMessage(error));
      }
    },
  });
  const register = mode === 'register';
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  return (
    <KeyboardAvoidingView
      style={[styles.safe, ruledPaper]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <KhataLogo size={52} />
            <View>
              <Text style={styles.brandName}>Khata</Text>
              <Text style={styles.brandTag}>Nepal accounting workspace</Text>
            </View>
          </View>

          <ChipRow />

          <Text testID="form-title" style={styles.title}>
            {register ? 'Open your ledger' : 'Sign in to your ledger'}
          </Text>
          <Text style={styles.subtitle}>
            {register
              ? 'Register the first admin to start a private, offline-first accounting workspace.'
              : 'Role-based accounting access for admins, accountants, and employees.'}
          </Text>

          <View style={styles.card}>
            {register && (
              <form.Field name="name" children={field => (
                <Input
                  testID="name"
                  label="Full name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  error={getFieldError(field)}
                  placeholder="Your name"
                  leftIcon={<UserIcon size={18} color={C.muted} />}
                />
              )} />
            )}

            <form.Field name="email" children={field => (
              <Input
                testID="email-input"
                label="Email address"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                error={getFieldError(field)}
                placeholder="you@company.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                leftIcon={<MailIcon size={18} color={C.muted} />}
              />
            )} />

            <form.Field name="password" children={field => (
              <Input
                testID="password-input"
                label="Password"
                placeholder="At least 6 characters"
                secureTextEntry={!showPassword}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                error={getFieldError(field)}
                autoComplete="current-password"
                leftIcon={<LockIcon size={18} color={C.muted} />}
                rightIcon={(
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    testID="toggle-password"
                    onPress={() => setShowPassword(current => !current)}
                    hitSlop={8}
                  >
                    {showPassword
                      ? <EyeOffIcon size={18} color={C.muted} />
                      : <EyeIcon size={18} color={C.muted} />}
                  </Pressable>
                )}
              />
            )} />

            <form.Subscribe selector={state => [state.isSubmitting]} children={([isSubmitting]) => (
              <View style={styles.submitWrap}>
                <Button
                  variant="secondary"
                  testID="login-button"
                  label={register ? 'Create account' : 'Sign in'}
                  onPress={form.handleSubmit}
                  loading={isSubmitting}
                />
              </View>
            )} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={register ? 'Switch to sign in' : 'Switch to account registration'}
              onPress={() => onModeChange?.(register ? 'login' : 'register')}
              style={({ pressed }) => [styles.switchLink, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.switch}>
                {register ? 'Already have an account? Sign in' : 'New workspace? Register first admin'}
              </Text>
            </Pressable>
          </View>

          {formError && (
            <View style={styles.errorBox}>
              <AlertTriangleIcon size={14} color={C.red} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <View style={styles.footnote}>
            <LockIcon size={12} color={C.muted} />
            <Text style={styles.footnoteText}>Your data stays private and works offline</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ChipRow() {
  return (
    <View style={styles.chip}>
      <LockIcon size={13} color={C.goldDark} />
      <Text style={styles.chipText}>Secure workspace access</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  brandName: { color: C.ink, fontSize: 24, fontWeight: '800', fontFamily: SERIF, letterSpacing: -0.3 },
  brandTag: { color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.yellowLight,
    borderColor: '#E0C88F',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  chipText: { color: C.goldDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { color: C.ink, fontSize: 32, lineHeight: 38, fontWeight: '800', fontFamily: SERIF, textAlign: 'center', marginTop: 4, letterSpacing: -0.5 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 360 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(253,248,238,0.95)',
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    gap: 6,
    marginTop: 10,
    shadowColor: C.brickDark,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  submitWrap: { marginTop: 8 },
  switchLink: { paddingVertical: 10 },
  switch: { color: C.brick, fontWeight: '800', fontSize: 13, textAlign: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '100%', backgroundColor: C.redLight, borderColor: '#DFB4A4', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },
  errorText: { color: C.red, fontSize: 12, fontWeight: '700', lineHeight: 18, flex: 1 },
  footnote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  footnoteText: { color: C.muted, fontSize: 11, fontWeight: '600' },
});
