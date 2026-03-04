import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/auth';
import { C, S, R, F, useThemeColors } from '../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStack } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStack, 'Register'>;

export function RegisterScreen({ navigation }: { navigation: Nav }) {
  const TC = useThemeColors();
  const { register, loading, error, clearErr } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');

  function normalizeDateOfBirth(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return undefined;

    return parsed.toISOString();
  }

  async function submit() {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !gender.trim() || !pass.trim()) {
      Alert.alert('Required', 'Please fill all required fields.');
      return;
    }

    if (pass !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match');
      return;
    }

    if (pass.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    const normalizedDob = normalizeDateOfBirth(dateOfBirth);
    if (dateOfBirth.trim() && !normalizedDob) {
      Alert.alert('Invalid date', 'Date of birth should be a valid date (e.g. 1998-05-21).');
      return;
    }

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: pass,
        gender: gender.trim(),
        location: location.trim() || undefined,
        dateOfBirth: normalizedDob,
      });
    } catch (registerError) {
      const message = registerError instanceof Error ? registerError.message : 'Unable to create account.';
      Alert.alert('Registration failed', message);
    }
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={TC.muted} />
            <Text style={s.back}>Back</Text>
          </TouchableOpacity>

          <Text style={[s.h1, { color: TC.text }]}>Create Account</Text>
          <Text style={[s.sub, { color: TC.muted }]}>Join thousands of gym-goers</Text>

          {!!error && (
            <View style={s.errBox}>
              <Text style={s.errTxt}>{error}</Text>
              <TouchableOpacity onPress={clearErr}>
                <Text style={s.errX}>x</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={s.form}>
            {[
              { label: 'FULL NAME *', val: fullName, set: setFullName, cap: 'words' as const, ph: 'Alex Rivera' },
              { label: 'EMAIL *', val: email, set: setEmail, cap: 'none' as const, ph: 'you@example.com', kb: 'email-address' as const },
              { label: 'PHONE *', val: phone, set: setPhone, cap: 'none' as const, ph: '+96170123456', kb: 'phone-pad' as const },
              { label: 'GENDER *', val: gender, set: setGender, cap: 'words' as const, ph: 'Male / Female / Other' },
              { label: 'LOCATION', val: location, set: setLocation, cap: 'words' as const, ph: 'Beirut' },
              { label: 'DATE OF BIRTH', val: dateOfBirth, set: setDateOfBirth, cap: 'none' as const, ph: 'YYYY-MM-DD' },
              { label: 'PASSWORD *', val: pass, set: setPass, cap: 'none' as const, ph: '••••••••', secure: true },
              { label: 'CONFIRM PASSWORD *', val: confirm, set: setConfirm, cap: 'none' as const, ph: '••••••••', secure: true },
            ].map((f) => (
              <View key={f.label}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput
                  style={s.input}
                  value={f.val}
                  onChangeText={f.set}
                  placeholder={f.ph}
                  placeholderTextColor={TC.muted}
                  autoCapitalize={f.cap}
                  keyboardType={f.kb}
                  secureTextEntry={f.secure}
                  autoCorrect={false}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
            <Text style={s.btnTxt}>{loading ? 'Creating…' : 'Create Account'}</Text>
          </TouchableOpacity>

          <View style={s.row}>
            <Text style={s.sub}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[s.link, { color: TC.primary }]}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, padding: S.lg },
  backRow: { marginBottom: S.lg, flexDirection: 'row', alignItems: 'center', gap: 4 },
  back: { color: C.muted, fontSize: F.base },
  h1: { fontSize: F.x3, fontWeight: '900', color: '#fff', marginBottom: 6 },
  sub: { fontSize: F.base, color: C.muted, marginBottom: S.lg },
  form: { gap: S.md, marginBottom: S.lg },
  errBox: {
    borderWidth: 1,
    borderColor: '#ef444455',
    backgroundColor: '#ef444422',
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S.md,
  },
  errTxt: { color: '#fecaca', fontWeight: '700', flex: 1, marginRight: 8 },
  errX: { color: '#fff', fontWeight: '800' },
  label: { color: C.muted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  input: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: 14, color: '#fff', fontSize: F.base },
  btn: { height: 56, backgroundColor: C.primary, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  btnTxt: { color: '#fff', fontSize: F.lg, fontWeight: '800' },
  link: { color: C.primary, fontSize: F.sm, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: S.xl },
});
