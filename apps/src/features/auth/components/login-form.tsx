import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, View } from 'react-native';
import * as z from 'zod';
import { Button, Input, Text } from '@/components/ui';
import { C, Chip } from '@/features/khata/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({ name: z.string().optional(), email: z.string().min(1, 'Email is required').email('Invalid email format'), password: z.string().min(6, 'Password must be at least 6 characters') });
export type FormType = z.infer<typeof schema>;
export type LoginFormProps = { onSubmit?: (data: FormType) => void; mode?: 'login' | 'register'; onModeChange?: (mode: 'login' | 'register') => void };

export function LoginForm({ onSubmit = () => {}, mode = 'login', onModeChange }: LoginFormProps) {
  const form = useForm({ defaultValues: { name: '', email: '', password: '' }, validators: { onChange: schema as any }, onSubmit: async ({ value }) => { onSubmit(value); } });
  const register = mode === 'register';
  return <KeyboardAvoidingView style={styles.safe} behavior="padding"><View style={styles.center}><Chip tone="gold">Secure workspace access</Chip><Text testID="form-title" style={styles.title}>{register ? 'Create your Khata account' : 'Login to Khata'}</Text><Text style={styles.subtitle}>Role-based accounting access for admins, accountants, and employees.</Text><View style={styles.card}>{register && <form.Field name="name" children={field => <Input testID="name" label="Full name" value={field.state.value} onBlur={field.handleBlur} onChangeText={field.handleChange} error={getFieldError(field)} />} />}<form.Field name="email" children={field => <Input testID="email-input" label="Email" value={field.state.value} onBlur={field.handleBlur} onChangeText={field.handleChange} error={getFieldError(field)} />} /><form.Field name="password" children={field => <Input testID="password-input" label="Password" placeholder="At least 6 characters" secureTextEntry value={field.state.value} onBlur={field.handleBlur} onChangeText={field.handleChange} error={getFieldError(field)} />} /><form.Subscribe selector={state => [state.isSubmitting]} children={([isSubmitting]) => <Button variant="secondary" testID="login-button" label={register ? 'Create account' : 'Login'} onPress={form.handleSubmit} loading={isSubmitting} />} /><Pressable onPress={() => onModeChange?.(register ? 'login' : 'register')}><Text style={styles.switch}>{register ? 'Already have an account? Login' : 'New workspace? Register first admin'}</Text></Pressable></View></View></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: C.cream }, center: { width: '100%', maxWidth: 460, alignSelf: 'center', justifyContent: 'center', flex: 1, padding: 24, alignItems: 'center', gap: 12 }, title: { color: C.ink, fontSize: 30, fontWeight: '800', textAlign: 'center', marginTop: 6 }, subtitle: { color: C.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 360 }, card: { width: '100%', backgroundColor: 'rgba(255,255,255,.9)', borderColor: C.border, borderWidth: 1, borderRadius: 18, padding: 18, gap: 4, marginTop: 8, shadowColor: '#7A4F31', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 }, switch: { color: C.brick, fontWeight: '700', fontSize: 12, textAlign: 'center', paddingVertical: 8 },
});
