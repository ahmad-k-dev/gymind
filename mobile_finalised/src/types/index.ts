export type UserRole = 'User' | 'GymAdmin';
export type Tier = 'Basic' | 'Gold' | 'Elite' | 'Platinum';
export type Traffic = 'Low' | 'Medium' | 'High';

export interface Offer {
  id: string;
  label: string;
  title: string;
  description: string;
  highlighted?: boolean;
}

export interface GymCoords {
  latitude: number;
  longitude: number;
}

export interface GymMedia {
  heroImage?: string;
  mapPreviewImage?: string;
}

export interface GymSocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  website?: string;
}

export interface User {
  id: string; name: string; email: string; role: UserRole;
  memberSince: string; tier: Tier; workouts: number; hours: number;
  phone: string;
  membershipNumber: string;
  age: number;
  heightCm: number;
  weightKg: number;
  avatarUrl: string;
  biography?: string;
  medicalConditions?: string;
  emergencyContact?: string;
  fitnessGoal?: string;
  trainingFrequencyPerWeek?: number;
  assessmentNotes?: string;
}

export interface Gym {
  id: string; name: string; address: string; distance: string;
  rating: number; reviews: number; traffic: Traffic;
  capacity: number; price: number; image: string;
  images: readonly string[];
  tags: string[]; about: string;
  coords?: GymCoords;
  media?: GymMedia;
  social?: GymSocialLinks;
  offers?: Offer[];
}

export interface ChatMsg {
  id: string; role: 'user' | 'assistant'; text: string; time: string;
}
