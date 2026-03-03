import { create } from 'zustand';
import {
  type Announcement,
  clearAnnouncementStorage,
  isAnnouncementExpired,
  loadAnnouncementFromStorage,
  saveAnnouncementToStorage,
} from '../../services/storage/announcementStorage';

interface AnnouncementState {
  announcement: Announcement | null;
  loadAnnouncement: () => Promise<void>;
  setAnnouncement: (announcement: Announcement) => Promise<void>;
  dismissAnnouncement: () => Promise<void>;
  clearAnnouncement: () => Promise<void>;
}

const DEFAULT_ANNOUNCEMENT: Announcement = {
  id: 'gymind-welcome',
  title: 'Welcome To GYMIND',
  message: 'New AI coaching upgrades are now live for your next training session.',
  expiresAt: '2026-12-31T23:59:59.000Z',
  isDismissed: false,
};

export const useAnnouncement = create<AnnouncementState>((set, get) => ({
  announcement: null,

  loadAnnouncement: async () => {
    const stored = await loadAnnouncementFromStorage();
    if (stored) {
      if (isAnnouncementExpired(stored)) {
        await clearAnnouncementStorage();
        set({ announcement: null });
        return;
      }
      set({ announcement: stored });
      return;
    }

    if (!isAnnouncementExpired(DEFAULT_ANNOUNCEMENT)) {
      await saveAnnouncementToStorage(DEFAULT_ANNOUNCEMENT);
      set({ announcement: DEFAULT_ANNOUNCEMENT });
    } else {
      set({ announcement: null });
    }
  },

  setAnnouncement: async (announcement) => {
    if (isAnnouncementExpired(announcement)) {
      await clearAnnouncementStorage();
      set({ announcement: null });
      return;
    }
    await saveAnnouncementToStorage(announcement);
    set({ announcement });
  },

  dismissAnnouncement: async () => {
    const current = get().announcement;
    if (!current) return;
    const dismissed: Announcement = { ...current, isDismissed: true };
    await saveAnnouncementToStorage(dismissed);
    set({ announcement: dismissed });
  },

  clearAnnouncement: async () => {
    await clearAnnouncementStorage();
    set({ announcement: null });
  },
}));

export const selectVisibleAnnouncement = (state: AnnouncementState): Announcement | null => {
  const item = state.announcement;
  if (!item) return null;
  if (item.isDismissed || isAnnouncementExpired(item)) return null;
  return item;
};
