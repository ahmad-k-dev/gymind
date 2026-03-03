import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, type ListRenderItem } from 'react-native';
import { C, F, R, S } from '../../../theme';
import type { Offer } from '../../../types';

interface OffersListProps {
  offers: Offer[];
}

const OfferCard = React.memo(function OfferCard({ offer }: { offer: Offer }) {
  return (
    <View style={[s.card, offer.highlighted ? s.cardActive : s.cardMuted]}>
      <Text style={[s.label, offer.highlighted ? s.labelActive : s.labelMuted]}>{offer.label}</Text>
      <Text style={s.title}>{offer.title}</Text>
      <Text style={s.desc}>{offer.description}</Text>
    </View>
  );
});

export const OffersList = React.memo(function OffersList({ offers }: OffersListProps) {
  const renderOffer = useCallback<ListRenderItem<Offer>>(({ item }) => <OfferCard offer={item} />, []);

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.sectionTitle}>Special Offers</Text>
        <TouchableOpacity activeOpacity={0.8}>
          <Text style={s.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.list}
        renderItem={renderOffer}
      />
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { gap: S.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: F.xl,
    fontWeight: '800',
    color: '#fff',
  },
  viewAll: {
    fontSize: F.sm,
    color: C.primary,
    fontWeight: '700',
  },
  list: { gap: S.md, paddingVertical: 2 },
  card: {
    width: 280,
    borderRadius: R.lg,
    borderWidth: 1,
    padding: S.md,
    gap: 6,
  },
  cardActive: {
    backgroundColor: C.primary + '14',
    borderColor: C.primary + '3B',
  },
  cardMuted: {
    backgroundColor: C.surface,
    borderColor: C.border,
  },
  label: {
    fontSize: F.xs,
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  labelActive: { color: C.primary },
  labelMuted: { color: C.muted },
  title: {
    fontSize: F.lg,
    color: '#fff',
    fontWeight: '800',
  },
  desc: {
    fontSize: F.sm,
    color: C.muted,
    lineHeight: 18,
  },
});
