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
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');

  async function submit() {
    if (!name || !email || !pass) { Alert.alert('Required', 'Fill in all fields'); return; }
    if (pass !== confirm) { Alert.alert('Mismatch', 'Passwords do not match'); return; }
    if (pass.length < 8) { Alert.alert('Weak', 'Password must be at least 8 characters'); return; }
    try { await register(name, email, pass); } catch {}
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

