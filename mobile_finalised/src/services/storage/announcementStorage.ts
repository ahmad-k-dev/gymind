import AsyncStorage from '@react-native-async-storage/async-storage';

const ANNOUNCEMENT_STORAGE_KEY = 'announcement:v1';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  expiresAt: string;
  isDismissed: boolean;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isAnnouncement = (value: unknown): value is Announcement => {
  if (!isObject(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.message === 'string' &&
    typeof value.expiresAt === 'string' &&
    typeof value.isDismissed === 'boolean'
  );
};

export const isAnnouncementExpired = (announcement: Announcement): boolean => {
  const expiresAtMs = Date.parse(announcement.expiresAt);
  if (Number.isNaN(expiresAtMs)) return true;
  return Date.now() >= expiresAtMs;
};

export async function loadAnnouncementFromStorage(): Promise<Announcement | null> {
  try {
    const raw = await AsyncStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isAnnouncement(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveAnnouncementToStorage(announcement: Announcement): Promise<void> {
  await AsyncStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(announcement));
}

export async function clearAnnouncementStorage(): Promise<void> {
  await AsyncStorage.removeItem(ANNOUNCEMENT_STORAGE_KEY);
}
