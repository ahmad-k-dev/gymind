import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { C, S, R, F, useThemeColors } from '../../theme';
import type { ChatMsg } from '../../types';

interface QuickPrompt {
  id: string;
  label: string;
  text: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

const INIT: ChatMsg[] = [
  { id: '1', role: 'assistant', text: 'Good morning! Gym traffic is 25% lower than usual right now. Perfect time for heavy legs.', time: '10:24 AM' },
];

const QUICK: QuickPrompt[] = [
  { id: 'workout-plan', label: 'Workout Plan', text: 'Workout Plan', icon: 'dumbbell' },
  { id: 'gym-capacity', label: 'Gym Capacity', text: 'Gym Capacity', icon: 'chart-bar' },
  { id: 'nutrition-tip', label: 'Nutrition Tip', text: 'Nutrition Tip', icon: 'food-apple-outline' },
  { id: 'my-stats', label: 'My Stats', text: 'My Stats', icon: 'chart-line' },
];

export function AIScreen() {
  const TC = useThemeColors();
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState<ChatMsg[]>(INIT);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<ChatMsg>>(null);
  const d1 = useSharedValue(1);
  const d2 = useSharedValue(1);
  const d3 = useSharedValue(1);

  useEffect(() => {
    if (typing) {
      d1.value = withRepeat(withTiming(1.5, { duration: 400 }), -1, true);
      setTimeout(() => {
        d2.value = withRepeat(withTiming(1.5, { duration: 400 }), -1, true);
      }, 150);
      setTimeout(() => {
        d3.value = withRepeat(withTiming(1.5, { duration: 400 }), -1, true);
      }, 300);
    } else {
      d1.value = 1;
      d2.value = 1;
      d3.value = 1;
    }
  }, [d1, d2, d3, typing]);

  const a1 = useAnimatedStyle(() => ({ transform: [{ scale: d1.value }] }));
  const a2 = useAnimatedStyle(() => ({ transform: [{ scale: d2.value }] }));
  const a3 = useAnimatedStyle(() => ({ transform: [{ scale: d3.value }] }));

  const scrollToEnd = useCallback((animated: boolean) => {
    listRef.current?.scrollToEnd({ animated });
  }, []);

  const send = useCallback(() => {
    if (!text.trim()) return;
    const msg: ChatMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMsgs((p) => [...p, msg]);
    setText('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((p) => [
        ...p,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'Based on your history, I recommend compound movements today. The gym is at optimal capacity right now, so timing is strong.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => scrollToEnd(true), 100);
    }, 1600);
    setTimeout(() => scrollToEnd(true), 100);
  }, [scrollToEnd, text]);

  const renderMessage = useCallback<ListRenderItem<ChatMsg>>(({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[s.msgRow, isUser && s.msgRowUser]}>
        {!isUser && (
          <View style={s.aiAvatar}>
            <MaterialCommunityIcons name="robot-outline" size={15} color="#fff" />
          </View>
        )}
        <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAI]}>
          <Text style={[s.bubbleTxt, isUser && { color: '#fff' }]}>{item.text}</Text>
          <Text style={s.time}>{item.time}</Text>
        </View>
      </View>
    );
  }, []);

  const renderQuick = useCallback<ListRenderItem<QuickPrompt>>(
    ({ item }) => (
      <TouchableOpacity style={s.chip} onPress={() => setText(item.text)}>
        <MaterialCommunityIcons name={item.icon} size={14} color={TC.text} />
        <Text style={s.chipTxt}>{item.label}</Text>
      </TouchableOpacity>
    ),
    [TC.text]
  );

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[s.header, { borderBottomColor: TC.border }]}>
          <View>
            <Text style={[s.title, { color: TC.text }]}>GI</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineTxt}>AI ONLINE</Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: S.md, gap: S.md, paddingBottom: S.lg }}
          showsVerticalScrollIndicator={false}
          onLayout={() => scrollToEnd(false)}
          renderItem={renderMessage}
          ListFooterComponent={
            typing ? (
              <View style={s.typingRow}>
                <View style={s.aiAvatar}>
                  <MaterialCommunityIcons name="robot-outline" size={15} color="#fff" />
                </View>
                <View style={s.typingBubble}>
                  <Animated.View style={[s.dot, { backgroundColor: TC.primary }, a1]} />
                  <Animated.View style={[s.dot, { backgroundColor: TC.primary }, a2]} />
                  <Animated.View style={[s.dot, { backgroundColor: TC.primary }, a3]} />
                </View>
              </View>
            ) : null
          }
        />

        <View style={[s.bottom, { borderTopColor: TC.border, paddingBottom: 44 + insets.bottom }]}>
          <FlatList
            data={QUICK}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingHorizontal: S.md, paddingVertical: S.sm, gap: 8 }}
            renderItem={renderQuick}
          />
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={text}
              onChangeText={setText}
              placeholder="Ask anything…"
              placeholderTextColor={TC.muted}
              onSubmitEditing={send}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity style={[s.sendBtn, { backgroundColor: TC.primary }]} onPress={send}>
              <MaterialCommunityIcons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  title: { fontSize: F.lg, fontWeight: '800', color: '#fff' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  onlineTxt: { fontSize: F.xs, color: C.green, fontWeight: '700', letterSpacing: 1 },
  msgRow: { flexDirection: 'row', gap: 8, maxWidth: '88%' },
  msgRowUser: { flexDirection: 'row-reverse', alignSelf: 'flex-end' },
  aiAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  bubble: { borderRadius: R.lg, padding: S.md, maxWidth: 280 },
  bubbleAI: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  bubbleTxt: { fontSize: F.base, color: C.text, lineHeight: 22 },
  time: { fontSize: 9, color: C.muted, marginTop: 4 },
  typingRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: S.sm },
  typingBubble: { flexDirection: 'row', gap: 4, backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: S.md, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary },
  bottom: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.full, paddingHorizontal: 14, paddingVertical: 7 },
  chipTxt: { fontSize: F.sm, color: C.text, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: S.md, marginBottom: S.md, backgroundColor: C.surface, borderRadius: R.full, borderWidth: 1, borderColor: C.border, paddingLeft: S.md, paddingRight: 6, paddingVertical: 6, gap: 8 },
  input: { flex: 1, color: C.text, fontSize: F.base, maxHeight: 90 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
});

