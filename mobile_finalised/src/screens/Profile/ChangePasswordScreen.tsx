import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStack } from '../../navigation/types';
import { C, F, R, S, useThemeColors } from '../../theme';
import { useAuth } from '../../store/auth';

type Nav = NativeStackNavigationProp<ProfileStack, 'ChangePassword'>;

function isStrongPassword(password: string) {
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSpecial;
}

export function ChangePasswordScreen({ navigation }: { navigation: Nav }) {
  const TC = useThemeColors();
  const user = useAuth((s) => s.user);
  const requestPasswordReset = useAuth((s) => s.requestPasswordReset);
  const resetPassword = useAuth((s) => s.resetPassword);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const passwordHintColor = useMemo(
    () => (newPassword.length === 0 || isStrongPassword(newPassword) ? TC.muted : C.red),
    [newPassword, TC.muted]
  );

  const onRequestToken = async () => {
    if (!user?.email) {
      Alert.alert('Missing email', 'Your account email is not available. Please log in again.');
      return;
    }

    setRequesting(true);
    try {
      const developmentToken = await requestPasswordReset(user.email);
      if (developmentToken) {
        setToken(developmentToken);
        Alert.alert('Reset token received', 'Development token was auto-filled.');
      } else {
        Alert.alert('Check your email', 'If your account exists, a reset link has been sent.');
      }
    } catch (error: unknown) {
      Alert.alert('Request failed', error instanceof Error ? error.message : 'Could not request reset token.');
    } finally {
      setRequesting(false);
    }
  };

  const onChangePassword = async () => {
    if (!token.trim()) {
      Alert.alert('Missing token', 'Please request/enter your reset token.');
      return;
    }

    if (!isStrongPassword(newPassword)) {
      Alert.alert('Weak password', 'Use at least 8 chars with upper/lowercase, number, and symbol.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'Confirm password must match the new password.');
      return;
    }

    setResetting(true);
    try {
      await resetPassword(token.trim(), newPassword);
      Alert.alert('Password changed', 'Your password has been updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      Alert.alert('Reset failed', error instanceof Error ? error.message : 'Could not reset your password.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={TC.muted} />
          <Text style={[s.backText, { color: TC.muted }]}>Back</Text>
        </TouchableOpacity>

        <Text style={[s.title, { color: TC.text }]}>Change Password</Text>
        <Text style={[s.subtitle, { color: TC.muted }]}>Under Personal Information</Text>

        <View style={[s.card, { backgroundColor: TC.surface, borderColor: TC.border }]}> 
          <Text style={[s.label, { color: TC.muted }]}>ACCOUNT EMAIL</Text>
          <Text style={[s.readonly, { color: TC.text }]}>{user?.email ?? '-'}</Text>

          <TouchableOpacity
            style={[s.primaryBtn, requesting && { opacity: 0.6 }]}
            onPress={onRequestToken}
            disabled={requesting}
          >
            <Text style={s.primaryBtnText}>{requesting ? 'Requesting…' : 'Request Reset Token'}</Text>
          </TouchableOpacity>

          <Text style={[s.label, { color: TC.muted }]}>RESET TOKEN</Text>
          <TextInput
            style={[s.input, { backgroundColor: TC.bg, borderColor: TC.border, color: TC.text }]}
            placeholder="Paste token"
            placeholderTextColor={TC.muted}
            autoCapitalize="none"
            autoCorrect={false}
            value={token}
            onChangeText={setToken}
          />

          <Text style={[s.label, { color: TC.muted }]}>NEW PASSWORD</Text>
          <TextInput
            style={[s.input, { backgroundColor: TC.bg, borderColor: TC.border, color: TC.text }]}
            placeholder="Enter new password"
            placeholderTextColor={TC.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Text style={[s.hint, { color: passwordHintColor }]}>8+ chars, upper/lowercase, number, symbol.</Text>

          <Text style={[s.label, { color: TC.muted }]}>CONFIRM NEW PASSWORD</Text>
          <TextInput
            style={[s.input, { backgroundColor: TC.bg, borderColor: TC.border, color: TC.text }]}
            placeholder="Confirm password"
            placeholderTextColor={TC.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[s.primaryBtn, resetting && { opacity: 0.6 }]}
            onPress={onChangePassword}
            disabled={resetting}
          >
            <Text style={s.primaryBtnText}>{resetting ? 'Changing…' : 'Change Password'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { padding: S.lg, gap: S.md, paddingBottom: 100 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: F.base, fontWeight: '600' },
  title: { fontSize: F.x2, fontWeight: '900' },
  subtitle: { fontSize: F.sm, fontWeight: '600' },
  card: { borderWidth: 1.5, borderRadius: R.md, padding: S.md, gap: S.sm },
  label: { fontSize: F.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  readonly: { fontSize: F.base, fontWeight: '700', marginBottom: S.sm },
  input: {
    borderWidth: 1.5,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 12,
    fontSize: F.base,
  },
  hint: { fontSize: F.xs, marginTop: -2, marginBottom: S.xs },
  primaryBtn: {
    height: 52,
    backgroundColor: C.primary,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: S.xs,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: F.base },
});
