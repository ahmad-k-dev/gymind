import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { C, F, R, S } from '../../theme';
import type { Announcement } from '../../services/storage/announcementStorage';

interface AnnouncementBannerProps {
  announcement: Announcement;
  onDismiss: () => void;
}

function AnnouncementBannerBase({ announcement, onDismiss }: AnnouncementBannerProps) {
  return (
    <View style={s.wrap}>
      <View style={s.left}>
        <MaterialCommunityIcons name="bullhorn-outline" size={18} color={C.primary} />
      </View>
      <View style={s.content}>
        <Text style={s.title} numberOfLines={1}>
          {announcement.title}
        </Text>
        <Text style={s.message} numberOfLines={2}>
          {announcement.message}
        </Text>
      </View>
      <TouchableOpacity style={s.close} onPress={onDismiss} hitSlop={8}>
        <MaterialCommunityIcons name="close" size={18} color={C.muted} />
      </TouchableOpacity>
    </View>
  );
}

export const AnnouncementBanner = React.memo(AnnouncementBannerBase);

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    borderRadius: R.md,
    marginHorizontal: S.lg,
    marginBottom: S.md,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
    gap: S.sm,
  },
  left: { width: 20, alignItems: 'center' },
  content: { flex: 1, gap: 2 },
  title: { fontSize: F.sm, color: '#fff', fontWeight: '800' },
  message: { fontSize: F.sm, color: C.muted, fontWeight: '500' },
  close: { padding: 4 },
});

