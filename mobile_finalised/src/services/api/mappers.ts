import type { Gym, Traffic, User } from '../../types';
import type {
  BackendGetUserDto,
  BackendGymDto,
  BackendGymSessionHistoryDto,
  BackendMembershipSummaryDto,
} from './types';

const TRAFFIC_LEVELS: readonly Traffic[] = ['Low', 'Medium', 'High'];

function pseudoNumberFromString(input: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  const normalized = Math.abs(hash) % (max - min + 1);
  return min + normalized;
}

export function mapGymFromBackend(dto: BackendGymDto): Gym {
  const syntheticSeed = dto.gymID || dto.name;
  const traffic = TRAFFIC_LEVELS[pseudoNumberFromString(syntheticSeed, 0, 2)];

  return {
    id: dto.gymID,
    name: dto.name,
    address: dto.description || 'Address unavailable',
    distance: `${(pseudoNumberFromString(syntheticSeed, 3, 50) / 10).toFixed(1)} km`,
    rating: pseudoNumberFromString(syntheticSeed, 38, 50) / 10,
    reviews: pseudoNumberFromString(syntheticSeed, 40, 2400),
    traffic,
    capacity: pseudoNumberFromString(syntheticSeed, 25, 100),
    price: pseudoNumberFromString(syntheticSeed, 25, 200),
    image: `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80&sig=${encodeURIComponent(syntheticSeed)}`,
    images: [],
    tags: ['Fitness'],
    about: dto.description || `${dto.name} is part of the GYMIND network.`,
  };
}

export function mapUserFromBackend(dto: BackendGetUserDto): User {
  const role = dto.roles.includes(1) ? 'GymAdmin' : 'User';
  const createdAt = new Date(dto.createdAt);

  return {
    id: dto.userID,
    name: dto.fullName,
    email: dto.email,
    role,
    memberSince: createdAt.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    tier: 'Basic',
    workouts: 0,
    hours: 0,
    phone: dto.phone ?? '',
    membershipNumber: dto.userID.slice(0, 8).toUpperCase(),
    age: 0,
    heightCm: 0,
    weightKg: 0,
    avatarUrl: '',
  };
}

export interface ComputedStatsPayload {
  weeklyMinutes: readonly { day: string; value: number }[];
  attendanceLast30: readonly { date: string; attended: boolean }[];
  totalWorkouts: number;
  totalHours: number;
}

export function buildComputedStats(history: readonly BackendGymSessionHistoryDto[]): ComputedStatsPayload {
  const now = new Date();
  const weeklyBuckets = new Map<string, number>();
  const attendanceMap = new Map<string, boolean>();

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    weeklyBuckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    attendanceMap.set(d.toISOString().slice(0, 10), false);
  }

  let totalMinutes = 0;

  history.forEach((session) => {
    const sessionDate = new Date(session.checkInTime).toISOString().slice(0, 10);
    const durationMinutes = session.durationMinutes || session.sessionDuration || 0;

    totalMinutes += durationMinutes;

    if (weeklyBuckets.has(sessionDate)) {
      weeklyBuckets.set(sessionDate, (weeklyBuckets.get(sessionDate) ?? 0) + durationMinutes);
    }

    if (attendanceMap.has(sessionDate)) {
      attendanceMap.set(sessionDate, true);
    }
  });

  return {
    weeklyMinutes: Array.from(weeklyBuckets.entries()).map(([date, value]) => ({
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      value,
    })),
    attendanceLast30: Array.from(attendanceMap.entries()).map(([date, attended]) => ({ date, attended })),
    totalWorkouts: history.length,
    totalHours: Math.round(totalMinutes / 60),
  };
}

export function mapLinkedGymFromMembership(
  memberships: readonly BackendMembershipSummaryDto[],
  gyms: readonly Gym[]
): { id: string; name: string; address: string; trafficLevel: Traffic; image: string } | null {
  const active = memberships.find((m) => m.isActive) ?? memberships[0];
  if (!active) return null;

  const linkedGym = gyms.find((gym) => gym.name.toLowerCase() === active.gymName.toLowerCase());
  if (!linkedGym) return null;

  return {
    id: linkedGym.id,
    name: active.gymName,
    address: linkedGym.address,
    trafficLevel: linkedGym.traffic,
    image: linkedGym.image,
  };
}
