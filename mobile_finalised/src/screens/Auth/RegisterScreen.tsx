import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
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
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    location: '',
    dateOfBirth: '',
    pass: '',
    confirm: '',
  });

  function normalizeDateOfBirth(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return undefined;

    return trimmed;
  }

  async function submit() {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.gender.trim() || !form.pass.trim()) {
      Alert.alert('Error', 'All marked fields are required');
      return;
    }

    if (!/^\+?[1-9]\d{7,14}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      Alert.alert('Invalid phone', 'Phone must be in international format, e.g. +201234567890.');
      return;
    }

    if (form.pass !== form.confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (form.pass.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    const normalizedDob = normalizeDateOfBirth(form.dateOfBirth);
    if (form.dateOfBirth.trim() && !normalizedDob) {
      Alert.alert('Invalid date', 'Date of birth should be a valid date (e.g. 1998-05-21).');
      return;
    }

    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.pass,
        gender: form.gender.trim(),
        location: form.location.trim() || undefined,
        dateOfBirth: normalizedDob,
      });
    } catch {
      // handled in store
    }
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={TC.muted} />
            <Text style={[s.back, { color: TC.muted }]}>Back</Text>
          </TouchableOpacity>

          <Text style={[s.h1, { color: TC.text }]}>Create Account</Text>
          <Text style={[s.sub, { color: TC.muted }]}>Join thousands of gym-goers</Text>

          {!!error && (
            <TouchableOpacity style={s.errBox} onPress={clearErr}>
              <Text style={s.errTxt}>{error} (Tap to clear)</Text>
            </TouchableOpacity>
          )}

          <View style={s.form}>
            <TextInput
              placeholder="Full Name *"
              placeholderTextColor={TC.muted}
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              value={form.fullName}
              onChangeText={(v) => setForm((prev) => ({ ...prev, fullName: v }))}
            />
            <TextInput
              placeholder="Email *"
              placeholderTextColor={TC.muted}
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              value={form.email}
              onChangeText={(v) => setForm((prev) => ({ ...prev, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Phone *"
              placeholderTextColor={TC.muted}
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              value={form.phone}
              onChangeText={(v) => setForm((prev) => ({ ...prev, phone: v }))}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Gender (Male/Female/Other) *"
              placeholderTextColor={TC.muted}
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              value={form.gender}
              onChangeText={(v) => setForm((prev) => ({ ...prev, gender: v }))}
            />
            <TextInput
              placeholder="Location (Optional)"
              placeholderTextColor={TC.muted}
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              value={form.location}
              onChangeText={(v) => setForm((prev) => ({ ...prev, location: v }))}
            />
            <TextInput
              placeholder="Date of Birth (YYYY-MM-DD)"
              placeholderTextColor={TC.muted}
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              value={form.dateOfBirth}
              onChangeText={(v) => setForm((prev) => ({ ...prev, dateOfBirth: v }))}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password *"
              placeholderTextColor={TC.muted}
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              secureTextEntry
              value={form.pass}
              onChangeText={(v) => setForm((prev) => ({ ...prev, pass: v }))}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Confirm Password *"
              placeholderTextColor={TC.muted}
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              secureTextEntry
              value={form.confirm}
              onChangeText={(v) => setForm((prev) => ({ ...prev, confirm: v }))}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btnTxt}>Create Account</Text>}
          </TouchableOpacity>

          <View style={s.row}>
            <Text style={[s.sub, { color: TC.muted, marginBottom: 0 }]}>Already have an account?</Text>
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
  scroll: { flexGrow: 1, padding: S.lg, paddingBottom: S.xl },
  backRow: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  back: { color: C.muted, fontSize: F.base },
  h1: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 8, marginBottom: 8 },
  sub: { color: '#a3a3a3', fontSize: F.base, marginBottom: S.lg },
  form: { gap: S.sm, marginBottom: S.md },
  errBox: { backgroundColor: '#cc0000', padding: 14, borderRadius: R.md, marginBottom: 16 },
  errTxt: { color: '#fff', fontSize: F.sm, fontWeight: '600' },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: F.base,
  },
  btn: { backgroundColor: '#CBFB5E', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnTxt: { fontWeight: '900', color: '#000', fontSize: 16 },
  link: { color: '#CBFB5E', fontSize: F.sm, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: S.lg },
});
