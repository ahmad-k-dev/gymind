import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { C, S, R, F, useThemeColors } from '../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStack } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStack, 'Forgot'>;

export function ForgotScreen({ navigation }: { navigation: Nav }) {
  const TC = useThemeColors();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.includes('@')) {
      Alert.alert('Invalid', 'Enter a valid email');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}>
      <View style={s.c}>
        <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={TC.muted} />
          <Text style={s.back}>Back</Text>
        </TouchableOpacity>
        <MaterialCommunityIcons name="lock-reset" size={48} color={TC.primary} />
        <Text style={[s.h1, { color: TC.text }]}>Reset Password</Text>
        <Text style={[s.sub, { color: TC.muted }]}>We'll send a reset link to your email.</Text>
        {sent && (
          <View style={s.ok}>
            <View style={s.okRow}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color={C.green} />
              <Text style={s.okTxt}>Check your inbox!</Text>
            </View>
          </View>
        )}
        <Text style={s.label}>EMAIL</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={TC.muted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={[s.btn, (loading || sent) && { opacity: 0.6 }]} onPress={submit} disabled={loading || sent}>
          <Text style={s.btnTxt}>{loading ? 'Sending…' : sent ? 'Sent!' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  c: { flex: 1, padding: S.lg, gap: S.md },
  backRow: { marginBottom: S.lg, flexDirection: 'row', alignItems: 'center', gap: 4 },
  back: { color: C.muted },
  h1: { fontSize: F.x3, fontWeight: '900', color: '#fff' },
  sub: { fontSize: F.base, color: C.muted },
  ok: { backgroundColor: '#22C55E20', borderWidth: 1, borderColor: '#22C55E44', borderRadius: R.md, padding: S.sm },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  okTxt: { color: C.green, fontWeight: '600' },
  label: { color: C.muted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  input: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: 14, color: '#fff', fontSize: F.base },
  btn: { height: 56, backgroundColor: C.primary, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  btnTxt: { color: '#fff', fontSize: F.lg, fontWeight: '800' },
});

