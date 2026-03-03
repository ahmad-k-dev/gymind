import React, { useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, type ListRenderItem } from 'react-native';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { useUI } from '../../store/ui';
import { C, S, R, F, useThemeColors } from '../../theme';

const W = Dimensions.get('window').width;
type OnboardingIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Slide {
  id: string;
  icon: OnboardingIcon;
  title: string;
  sub: string;
  color: string;
}

const SLIDES: Slide[] = [
  { id: '1', icon: 'map-search-outline', title: 'Discover Gyms\nNear You', sub: 'Real-time traffic and live capacity data to find your perfect spot.', color: C.primary },
  { id: '2', icon: 'qrcode-scan', title: 'Check In\nwith a Tap', sub: 'Your digital membership. Scan and go - no wallet needed.', color: C.blue },
  { id: '3', icon: 'robot-outline', title: 'AI Fitness\nCoach', sub: 'Personalized plans, nutrition tips and real-time insights.', color: C.green },
];

export function OnboardingScreen() {
  const TC = useThemeColors();
  const done = useUI((s) => s.completeOnboarding);
  const [idx, setIdx] = useState(0);
  const ref = useRef<FlatList<Slide>>(null);

  const next = () => {
    if (idx < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: idx + 1, animated: true });
    } else {
      done();
    }
  };

  const renderSlide: ListRenderItem<Slide> = ({ item }) => (
    <View style={[s.slide, { width: W }]}>
      <View style={[s.iconBox, { backgroundColor: item.color + '22', borderColor: item.color + '44' }]}>
        <MaterialCommunityIcons name={item.icon} size={56} color={item.color} />
      </View>
      <Text style={[s.accent, { color: item.color }]}>GYMIND</Text>
      <Text style={[s.title, { color: TC.text }]}>{item.title}</Text>
      <Text style={[s.sub, { color: TC.muted }]}>{item.sub}</Text>
    </View>
  );

  return (
    <View style={[s.c, { backgroundColor: TC.bg }]}>
      <TouchableOpacity style={s.skip} onPress={done}>
        <Text style={[s.skipTxt, { color: TC.muted }]}>Skip</Text>
      </TouchableOpacity>
      <FlatList
        ref={ref}
        data={SLIDES}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems[0]?.index != null) setIdx(viewableItems[0].index);
        }}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        style={{ flex: 1 }}
        renderItem={renderSlide}
      />
      <View style={s.footer}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === idx ? s.dotOn : s.dotOff]} />
          ))}
        </View>
        <TouchableOpacity style={[s.btn, { backgroundColor: SLIDES[idx].color }]} onPress={next}>
          <View style={s.nextRow}>
            <Text style={s.btnTxt}>{idx === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
            <MaterialCommunityIcons
              name={idx === SLIDES.length - 1 ? 'rocket-launch-outline' : 'arrow-right'}
              size={18}
              color="#fff"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg },
  skip: { position: 'absolute', top: 54, right: S.lg, zIndex: 10, padding: S.sm },
  skipTxt: { color: C.muted, fontSize: F.base, fontWeight: '600' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.xl, gap: S.lg },
  iconBox: { width: 120, height: 120, borderRadius: 36, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: S.sm },
  accent: { fontSize: F.xs, fontWeight: '800', letterSpacing: 4, textTransform: 'uppercase' },
  title: { fontSize: F.x3, fontWeight: '900', color: '#fff', textAlign: 'center', lineHeight: 36 },
  sub: { fontSize: F.md, color: C.muted, textAlign: 'center', lineHeight: 24, maxWidth: 280 },
  footer: { paddingHorizontal: S.lg, paddingBottom: 48, gap: S.lg, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotOn: { width: 24, backgroundColor: C.primary },
  dotOff: { width: 8, backgroundColor: C.muted, opacity: 0.4 },
  btn: { width: '100%', height: 56, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  btnTxt: { color: '#fff', fontSize: F.lg, fontWeight: '800' },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

