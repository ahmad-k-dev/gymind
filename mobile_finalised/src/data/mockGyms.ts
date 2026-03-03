import type { Gym, GymCoords, GymMedia, GymSocialLinks, Offer } from '../types';

export interface GymProfileDetails {
  coords?: GymCoords;
  media?: GymMedia;
  social?: GymSocialLinks;
  offers?: Offer[];
  images?: readonly string[];
}

const FALLBACK_IMAGES: readonly string[] = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1400&q=80',
];

function normalizeImages(primaryImage: string, rawImages?: readonly string[]): readonly string[] {
  const candidates = [primaryImage, ...(rawImages ?? [])].filter((value): value is string => value.length > 0);

  if (candidates.length === 0) return FALLBACK_IMAGES;

  const unique = Array.from(new Set(candidates));
  if (unique.length >= 3) return unique.slice(0, 3);
  if (unique.length === 2) return [unique[0], unique[1], unique[1]];
  return [unique[0], FALLBACK_IMAGES[1], FALLBACK_IMAGES[2]];
}

export const GYM_PROFILE_DETAILS: Record<string, GymProfileDetails> = {
  '1': {
    coords: { latitude: 40.750504, longitude: -73.993439 },
    media: {
      mapPreviewImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80',
    },
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1400&q=80',
    ],
    social: {
      instagram: 'https://instagram.com/apexfitness',
      facebook: 'https://facebook.com/apexfitness',
      whatsapp: 'https://wa.me/12135551212',
      website: 'https://example.com/the-forge-elite',
    },
    offers: [
      {
        id: 'new-member',
        label: 'New Member Special',
        title: '50% Off First Month',
        description: 'Join today and save half on your first month of membership.',
        highlighted: true,
      },
      {
        id: 'kickstart',
        label: 'Kickstart',
        title: 'Free PT Session',
        description: 'Get a complimentary 60-minute session with a pro trainer.',
      },
    ],
  },
  '2': {
    coords: { latitude: 40.740589, longitude: -73.987148 },
    media: {
      mapPreviewImage: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1200&q=80',
    },
    images: [
      'https://images.unsplash.com/photo-1549476464-37392f717541?w=1400&q=80',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1400&q=80',
      'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=1400&q=80',
    ],
    social: {
      instagram: 'https://instagram.com/ironparadise',
      whatsapp: 'https://wa.me/12135550002',
      website: 'https://example.com/iron-paradise',
    },
  },
  '3': {
    coords: { latitude: 40.746117, longitude: -74.001801 },
    media: {
      mapPreviewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    },
    images: [
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1400&q=80',
      'https://images.unsplash.com/photo-1597452485677-d6614f8960bb?w=1400&q=80',
      'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=1400&q=80',
    ],
    social: {
      facebook: 'https://facebook.com/olympusathletics',
      website: 'https://example.com/olympus-athletics',
    },
  },
  '4': {
    coords: { latitude: 40.744301, longitude: -73.995011 },
    media: {
      mapPreviewImage: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=1200&q=80',
    },
    images: [
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&q=80',
    ],
    social: {
      instagram: 'https://instagram.com/crunchfitness',
      facebook: 'https://facebook.com/crunchfitness',
    },
  },
  '5': {
    coords: { latitude: 40.742962, longitude: -73.989685 },
    media: {
      mapPreviewImage: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=1200&q=80',
    },
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1400&q=80',
    ],
    social: {
      instagram: 'https://instagram.com/equinox',
      facebook: 'https://facebook.com/equinox',
      whatsapp: 'https://wa.me/12135550005',
      website: 'https://example.com/equinox-nomad',
    },
  },
};

export function normalizeGymProfile(gym: Gym): Gym {
  const details = GYM_PROFILE_DETAILS[gym.id];

  const mergedSocial: GymSocialLinks | undefined =
    gym.social || details?.social
      ? {
          ...(details?.social ?? {}),
          ...(gym.social ?? {}),
        }
      : undefined;

  const images = normalizeImages(gym.image, gym.images.length > 0 ? gym.images : details?.images);

  return {
    ...gym,
    images,
    coords: gym.coords ?? details?.coords,
    media: {
      ...(details?.media ?? {}),
      ...(gym.media ?? {}),
    },
    social: mergedSocial,
    offers: gym.offers ?? details?.offers,
  };
}

