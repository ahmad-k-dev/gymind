import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStack } from '../../navigation/types';
import { useNotifications } from '../../features/notifications/notificationsSlice';
import { F, R, S, useThemeColors } from '../../theme';

type Props = NativeStackScreenProps<HomeStack, 'Notifications'>;

function fmt(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '--';
  return dt.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function NotificationsScreen({ navigation }: Props) {
  const TC = useThemeColors();
  const items = useNotifications((state) => state.items);
  const loading = useNotifications((state) => state.loading);
  const error = useNotifications((state) => state.error);
  const hydrateNotifications = useNotifications((state) => state.hydrateNotifications);
  const markAsRead = useNotifications((state) => state.markAsRead);

  React.useEffect(() => {
    void hydrateNotifications();
  }, [hydrateNotifications]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: TC.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={TC.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: TC.text }]}>Notifications</Text>
        <View style={s.backBtn} />
      </View>

      {loading && <Text style={[s.meta, { color: TC.muted }]}>Loading…</Text>}
      {!!error && <Text style={[s.meta, { color: '#F87171' }]}>{error}</Text>}

      <FlatList
        data={items}
        keyExtractor={(item) => item.notificationID}
        contentContainerStyle={s.list}
        ListEmptyComponent={!loading ? <Text style={[s.meta, { color: TC.muted }]}>No notifications yet.</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              s.card,
              {
                backgroundColor: TC.surface,
                borderColor: TC.border,
                opacity: item.isRead ? 0.7 : 1,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => {
              if (!item.isRead) {
                void markAsRead(item.notificationID);
              }
            }}
          >
            <View style={s.row}>
              <Text style={[s.cardTitle, { color: TC.text }]}>{item.title}</Text>
              {!item.isRead && <View style={[s.unreadDot, { backgroundColor: TC.primary }]} />}
            </View>
            <Text style={[s.cardBody, { color: TC.muted }]}>{item.message}</Text>
            <Text style={[s.cardTime, { color: TC.muted }]}>{fmt(item.sentAt)}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 28, alignItems: 'flex-start' },
  title: { fontSize: F.lg, fontWeight: '800' },
  list: { padding: S.lg, gap: S.sm },
  meta: { marginHorizontal: S.lg, marginTop: S.md, fontSize: F.sm },
  card: {
    borderWidth: 1,
    borderRadius: R.md,
    padding: S.md,
    gap: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: F.base, fontWeight: '800' },
  cardBody: { fontSize: F.sm, lineHeight: 20 },
  cardTime: { fontSize: F.xs, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
