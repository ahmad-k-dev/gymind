import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../store/auth';

export function RegisterScreen() {
  const { register, loading, error, clearErr } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', gender: '', pass: '', confirm: ''
  });

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.gender || !form.pass) {
      return Alert.alert("Error", "All marked fields are required");
    }
    if (form.pass !== form.confirm) {
      return Alert.alert("Error", "Passwords do not match");
    }

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        password: form.pass,
      });
      // RootNavigator will automatically redirect because 'authed' is now true
    } catch (e) {
      // Error handled by store
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
      <Text style={s.h1}>Sign Up</Text>
      
      {error ? (
        <TouchableOpacity style={s.err} onPress={clearErr}>
          <Text style={{color: '#fff'}}>{error} (Tap to clear)</Text>
        </TouchableOpacity>
      ) : null}

      <TextInput placeholder="Full Name *" placeholderTextColor="#666" style={s.input} onChangeText={v => setForm({...form, fullName: v})} />
      <TextInput placeholder="Email *" placeholderTextColor="#666" style={s.input} onChangeText={v => setForm({...form, email: v})} keyboardType="email-address" />
      <TextInput placeholder="Phone *" placeholderTextColor="#666" style={s.input} onChangeText={v => setForm({...form, phone: v})} keyboardType="phone-pad" />
      <TextInput placeholder="Gender (Male/Female) *" placeholderTextColor="#666" style={s.input} onChangeText={v => setForm({...form, gender: v})} />
      <TextInput placeholder="Password *" placeholderTextColor="#666" style={s.input} secureTextEntry onChangeText={v => setForm({...form, pass: v})} />
      <TextInput placeholder="Confirm Password *" placeholderTextColor="#666" style={s.input} secureTextEntry onChangeText={v => setForm({...form, confirm: v})} />

      <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btnTxt}>CREATE ACCOUNT</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  h1: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  input: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  btn: { backgroundColor: '#CBFB5E', padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnTxt: { fontWeight: 'bold', color: '#000', fontSize: 16 },
  err: { backgroundColor: '#cc0000', padding: 15, borderRadius: 10, marginBottom: 20 }
});