import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/auth';
import { C, S, R, F, useThemeColors } from '../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStack } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStack, 'Login'>;

export function LoginScreen({ navigation }: { navigation: Nav }) {
  const TC = useThemeColors();
  const { login, loading, error, clearErr } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function submit() {
    if (!email || !pass) {
      Alert.alert('Required', 'Fill in all fields');
      return;
    }
    try {
      await login(email, pass);
    } catch {}
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.logoRow}>
            <View style={s.logo}>
              <MaterialCommunityIcons name="dumbbell" size={28} color="#fff" />
            </View>
            <Text style={[s.brand, { color: TC.text }]}>GYMIND</Text>
          </View>
          <Text style={[s.h1, { color: TC.text }]}>Welcome back</Text>
          <Text style={[s.sub, { color: TC.muted }]}>Sign in to your account</Text>
          {!!error && (
            <View style={s.errBox}>
              <Text style={s.errTxt}>{error}</Text>
              <TouchableOpacity onPress={clearErr}>
                <Text style={s.errX}>x</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={s.form}>
            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={TC.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={s.label}>PASSWORD</Text>
            <View style={s.passRow}>
              <TextInput
                style={s.passInput}
                value={pass}
                onChangeText={setPass}
                placeholder="••••••••"
                placeholderTextColor={TC.muted}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                <MaterialCommunityIcons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={TC.muted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Forgot')} style={{ alignSelf: 'flex-end' }}>
              <Text style={[s.link, { color: TC.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
            <Text style={s.btnTxt}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </TouchableOpacity>
          <View style={s.row}>
            <Text style={s.sub}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[s.link, { color: TC.primary }]}> Sign Up</Text>
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
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: S.xl },
  logo: { width: 52, height: 52, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: F.x2, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  h1: { fontSize: F.x3, fontWeight: '900', color: '#fff', marginBottom: 6 },
  sub: { fontSize: F.base, color: C.muted, marginBottom: S.lg },
  errBox: { backgroundColor: '#EF444420', borderWidth: 1, borderColor: '#EF444455', borderRadius: R.md, padding: S.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  errTxt: { color: '#EF4444', fontSize: F.sm, flex: 1 },
  errX: { color: '#EF4444', fontSize: F.lg, paddingLeft: S.sm },
  form: { gap: S.sm, marginBottom: S.lg },
  label: { color: C.muted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  input: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: 14, color: '#fff', fontSize: F.base },
  passRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: R.md, paddingHorizontal: S.md },
  passInput: { flex: 1, paddingVertical: 14, color: '#fff', fontSize: F.base },
  link: { color: C.primary, fontSize: F.sm, fontWeight: '700' },
  btn: { height: 56, backgroundColor: C.primary, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  btnTxt: { color: '#fff', fontSize: F.lg, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: S.xl },
});

