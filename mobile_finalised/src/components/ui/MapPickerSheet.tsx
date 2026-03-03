import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import type { MapPreference } from '../../features/ui/ui.types';
import { F, R, S, useThemeColors } from '../../theme';

interface AvailableMapOptions {
  default: boolean;
  apple?: boolean;
  google?: boolean;
}

interface MapPickerSheetProps {
  visible: boolean;
  availableOptions: AvailableMapOptions;
  onSelect: (preference: MapPreference, rememberChoice: boolean) => void;
  onClose: () => void;
}

const OPTION_ORDER: readonly MapPreference[] = ['default', 'apple', 'google'];

const OPTION_LABELS: Record<MapPreference, string> = {
  default: 'Default Maps',
  apple: 'Apple Maps',
  google: 'Google Maps',
};

export const MapPickerSheet = React.memo(function MapPickerSheet({
  visible,
  availableOptions,
  onSelect,
  onClose,
}: MapPickerSheetProps) {
  const TC = useThemeColors();
  const [rememberChoice, setRememberChoice] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setRememberChoice(false);
    }
  }, [visible]);

  const options = React.useMemo(() => {
    return OPTION_ORDER.filter((option) => {
      if (option === 'default') return availableOptions.default;
      if (option === 'apple') return Boolean(availableOptions.apple);
      return Boolean(availableOptions.google);
    });
  }, [availableOptions]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[s.sheet, { backgroundColor: TC.surface, borderColor: TC.border }]}>
          <Text style={[s.title, { color: TC.text }]}>Open Maps With</Text>

          <View style={s.optionsWrap}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[s.optionBtn, { borderColor: TC.border, backgroundColor: TC.surface2 }]}
                onPress={() => onSelect(option, rememberChoice)}
                activeOpacity={0.85}
              >
                <Text style={[s.optionText, { color: TC.text }]}>{OPTION_LABELS[option]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.rememberRow}>
            <Text style={[s.rememberText, { color: TC.muted }]}>Remember my choice</Text>
            <Switch
              value={rememberChoice}
              onValueChange={setRememberChoice}
              thumbColor="#fff"
              trackColor={{ false: TC.surface2, true: TC.primary }}
            />
          </View>

          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={[s.cancelText, { color: TC.muted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    borderWidth: 1,
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
    paddingBottom: S.xl,
    gap: S.md,
  },
  title: {
    fontSize: F.lg,
    fontWeight: '800',
  },
  optionsWrap: {
    gap: S.sm,
  },
  optionBtn: {
    height: 48,
    borderRadius: R.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: F.base,
    fontWeight: '700',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rememberText: {
    fontSize: F.sm,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  cancelText: {
    fontSize: F.base,
    fontWeight: '700',
  },
});

