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
      // RootNavigator will automatically redirect because 'authed' is now true
    } catch (e) {
      // Error handled by store
    }
  };

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
          <View style={s.form}>
            {[
              { label:'FULL NAME', val:name, set:setName, cap:'words' as const, ph:'Alex Rivera' },
              { label:'EMAIL', val:email, set:setEmail, cap:'none' as const, ph:'you@example.com', kb:'email-address' as const },
              { label:'PASSWORD', val:pass, set:setPass, cap:'none' as const, ph:'••••••••', secure:true },
              { label:'CONFIRM PASSWORD', val:confirm, set:setConfirm, cap:'none' as const, ph:'••••••••', secure:true },
            ].map(f => (
              <View key={f.label}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput style={s.input} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={TC.muted} autoCapitalize={f.cap} keyboardType={f.kb} secureTextEntry={f.secure} autoCorrect={false} />
              </View>
            ))}
          </View>
          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
            <Text style={s.btnTxt}>{loading ? 'Creating…' : 'Create Account'}</Text>
          </TouchableOpacity>
          <View style={s.row}>
            <Text style={s.sub}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={[s.link, { color: TC.primary }]}> Sign In</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:C.bg },
  scroll: { flexGrow:1, padding:S.lg },
  backRow: { marginBottom:S.lg, flexDirection:'row', alignItems:'center', gap:4 },
  back: { color:C.muted, fontSize:F.base },
  h1: { fontSize:F.x3, fontWeight:'900', color:'#fff', marginBottom:6 },
  sub: { fontSize:F.base, color:C.muted, marginBottom:S.lg },
  form: { gap:S.md, marginBottom:S.lg },
  label: { color:C.muted, fontSize:F.xs, fontWeight:'700', letterSpacing:1, textTransform:'uppercase', marginBottom:4 },
  input: { backgroundColor:C.surface, borderWidth:1.5, borderColor:C.border, borderRadius:R.md, paddingHorizontal:S.md, paddingVertical:14, color:'#fff', fontSize:F.base },
  btn: { height:56, backgroundColor:C.primary, borderRadius:R.md, alignItems:'center', justifyContent:'center', elevation:8 },
  btnTxt: { color:'#fff', fontSize:F.lg, fontWeight:'800' },
  link: { color:C.primary, fontSize:F.sm, fontWeight:'700' },
  row: { flexDirection:'row', justifyContent:'center', marginTop:S.xl },
});

