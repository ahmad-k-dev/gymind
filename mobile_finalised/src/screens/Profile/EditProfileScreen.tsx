import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../store/auth';
import { C, S, R, F, useThemeColors } from '../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStack } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStack, 'EditProfile'>;

export function EditProfileScreen({ navigation }: { navigation: Nav }) {
  const TC = useThemeColors();
  const user = useAuth(s => s.user);
  const updateProfile = useAuth(s => s.updateProfile);
  const updateAvatar = useAuth(s => s.updateAvatar);
  const [name, setName] = useState(user?.name ?? '');
  const [heightCm, setHeightCm] = useState(user?.heightCm ? String(user.heightCm) : '');
  const [weightKg, setWeightKg] = useState(user?.weightKg ? String(user.weightKg) : '');
  const [biography, setBiography] = useState(user?.biography ?? '');
  const [medicalConditions, setMedicalConditions] = useState(user?.medicalConditions ?? '');
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal ?? '');
  const [trainingFrequencyPerWeek, setTrainingFrequencyPerWeek] = useState(
    user?.trainingFrequencyPerWeek ? String(user.trainingFrequencyPerWeek) : ''
  );
  const [assessmentNotes, setAssessmentNotes] = useState(user?.assessmentNotes ?? '');

  function digitsOnly(value: string) {
    return value.replace(/\D+/g, '');
  }

  const heightNum = Number(heightCm);
  const weightNum = Number(weightKg);
  const bmi = heightNum > 0 && weightNum > 0 ? weightNum / ((heightNum / 100) * (heightNum / 100)) : 0;

  async function save() {
    const trainingFreqNum = Number(trainingFrequencyPerWeek);

    if (!name.trim()) return Alert.alert('Invalid name', 'Please enter your full name.');
    if (!Number.isInteger(heightNum) || heightNum < 80 || heightNum > 250) return Alert.alert('Invalid height', 'Height must be between 80 and 250 cm.');
    if (!Number.isInteger(weightNum) || weightNum < 20 || weightNum > 300) return Alert.alert('Invalid weight', 'Weight must be between 20 and 300 kg.');
    if (
      trainingFrequencyPerWeek.trim().length > 0 &&
      (!Number.isInteger(trainingFreqNum) || trainingFreqNum < 0 || trainingFreqNum > 14)
    ) {
      return Alert.alert('Invalid frequency', 'Training frequency must be between 0 and 14 sessions per week.');
    }

    try {
      await updateProfile({
        name: name.trim(),
        biography: biography.trim(),
        medicalConditions: medicalConditions.trim(),
      });
      Alert.alert('Saved', 'Profile updated successfully!');
      navigation.goBack();
    } catch {
      Alert.alert('Update failed', 'Could not update your profile right now.');
    }
  }

  const pickAvatar = React.useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'Media library permission is required to update your photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length) return;
      await updateAvatar(result.assets[0].uri);
    } catch {
      Alert.alert('Image update failed', 'Please try selecting an image again.');
    }
  }, [updateAvatar]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.nav}>
          <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={TC.muted} />
            <Text style={[s.back, { color: TC.muted }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[s.title, { color: TC.text }]}>Edit Profile</Text>
          <TouchableOpacity onPress={save}><Text style={s.save}>Save</Text></TouchableOpacity>
        </View>
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={s.avatarImg} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 40, color: '#fff', fontWeight: '900' }}>{name.trim().charAt(0).toUpperCase() || 'A'}</Text>
            )}
          </View>
          <View style={s.avatarActions}>
            <TouchableOpacity onPress={pickAvatar}><Text style={s.changePhoto}>Edit Photo</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { void updateAvatar(''); }}><Text style={s.removePhoto}>Remove Photo</Text></TouchableOpacity>
          </View>
        </View>

        {[
          { label: 'FULL NAME', val: name, set: setName, cap: 'words' as const },
          { label: 'BIOGRAPHY', val: biography, set: setBiography, cap: 'sentences' as const, multiline: true },
          { label: 'MEDICAL CONDITIONS', val: medicalConditions, set: setMedicalConditions, cap: 'sentences' as const, multiline: true },
          { label: 'FITNESS GOAL', val: fitnessGoal, set: setFitnessGoal, cap: 'sentences' as const, multiline: true },
          {
            label: 'TRAINING FREQUENCY (SESSIONS/WEEK)',
            val: trainingFrequencyPerWeek,
            set: (v: string) => setTrainingFrequencyPerWeek(digitsOnly(v)),
            cap: 'none' as const,
            kb: 'number-pad' as const,
          },
          { label: 'ASSESSMENT FEEDBACK', val: assessmentNotes, set: setAssessmentNotes, cap: 'sentences' as const, multiline: true },
        ].map(f => (
          <View key={f.label} style={s.field}>
            <Text style={[s.label, { color: TC.muted }]}>{f.label}</Text>
            <TextInput
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }, f.multiline && s.inputMulti]}
              value={f.val}
              onChangeText={f.set}
              autoCapitalize={f.cap}
              keyboardType={f.kb}
              autoCorrect={false}
              placeholderTextColor={TC.muted}
              multiline={f.multiline}
              textAlignVertical={f.multiline ? 'top' : 'center'}
            />
          </View>
        ))}

        <View style={s.row}>
          <View style={[s.field, s.rowField]}>
            <Text style={[s.label, { color: TC.muted }]}>HEIGHT (CM)</Text>
            <TextInput
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              value={heightCm}
              onChangeText={(v) => setHeightCm(digitsOnly(v))}
              autoCapitalize="none"
              keyboardType="number-pad"
              autoCorrect={false}
              placeholderTextColor={TC.muted}
            />
          </View>
          <View style={[s.field, s.rowField]}>
            <Text style={[s.label, { color: TC.muted }]}>WEIGHT (KG)</Text>
            <TextInput
              style={[s.input, { backgroundColor: TC.surface, borderColor: TC.border, color: TC.text }]}
              value={weightKg}
              onChangeText={(v) => setWeightKg(digitsOnly(v))}
              autoCapitalize="none"
              keyboardType="number-pad"
              autoCorrect={false}
              placeholderTextColor={TC.muted}
            />
          </View>
        </View>

        <View style={[s.bmiCard, { backgroundColor: TC.surface, borderColor: TC.border }]}>
          <Text style={[s.label, { color: TC.muted }]}>BMI</Text>
          <Text style={[s.bmiValue, { color: TC.text }]}>{bmi > 0 ? bmi.toFixed(1) : '--'}</Text>
          <Text style={[s.bmiHint, { color: TC.muted }]}>Calculated from height and weight</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:C.bg },
  scroll: { padding:S.lg, gap:S.lg },
  nav: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  backRow: { flexDirection:'row', alignItems:'center', gap:4 },
  back: { color:C.muted, fontSize:F.base, fontWeight:'600' },
  title: { fontSize:F.lg, fontWeight:'800', color:'#fff' },
  save: { color:C.primary, fontSize:F.base, fontWeight:'800' },
  avatarWrap: { alignItems:'center', gap:S.sm, marginVertical:S.lg },
  avatar: { width:90, height:90, borderRadius:45, backgroundColor:C.primary, alignItems:'center', justifyContent:'center' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 45 },
  avatarActions: { flexDirection:'row', gap:S.md },
  changePhoto: { color:C.primary, fontSize:F.sm, fontWeight:'700' },
  removePhoto: { color:C.red, fontSize:F.sm, fontWeight:'700' },
  field: { gap:S.xs },
  row: { flexDirection:'row', gap:S.sm },
  rowField: { flex: 1 },
  label: { color:C.muted, fontSize:F.xs, fontWeight:'700', letterSpacing:1, textTransform:'uppercase' },
  input: { backgroundColor:C.surface, borderWidth:1.5, borderColor:C.border, borderRadius:R.md, paddingHorizontal:S.md, paddingVertical:14, color:'#fff', fontSize:F.base },
  inputMulti: { minHeight: 96, paddingTop: 12 },
  bmiCard: { backgroundColor:C.surface, borderWidth:1.5, borderColor:C.border, borderRadius:R.md, padding:S.md, gap:4 },
  bmiValue: { color:'#fff', fontSize:F.x2, fontWeight:'900' },
  bmiHint: { color:C.muted, fontSize:F.xs, fontWeight:'600' },
});
