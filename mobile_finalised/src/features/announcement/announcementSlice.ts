import { create } from 'zustand';
import { getMyAnnouncementsApi } from '../../services/api/announcementsApi';
import type { BackendAnnouncementDto } from '../../services/api/types';
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

function mapAnnouncement(dto: BackendAnnouncementDto): Announcement {
  return {
    id: dto.announcementID,
    title: dto.title,
    message: dto.content,
    expiresAt: dto.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isDismissed: false,
  };
}

export const useAnnouncement = create<AnnouncementState>((set, get) => ({
  announcement: null,

  loadAnnouncement: async () => {
    let dismissed: Announcement | null = null;
    const stored = await loadAnnouncementFromStorage();
    if (stored && !isAnnouncementExpired(stored)) {
      dismissed = stored;
    }

    try {
      const announcements = await getMyAnnouncementsApi();
      const latest = announcements[0] ? mapAnnouncement(announcements[0]) : null;

      if (!latest) {
        set({ announcement: null });
        return;
      }

      if (dismissed && dismissed.id === latest.id && dismissed.isDismissed) {
        set({ announcement: dismissed });
        return;
      }

      await saveAnnouncementToStorage(latest);
      set({ announcement: latest });
    } catch {
      set({ announcement: dismissed });
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
