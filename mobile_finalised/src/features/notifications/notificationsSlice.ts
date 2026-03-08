import { create } from 'zustand';
import { extractApiErrorMessage } from '../../services/api/errors';
import { getMyNotificationsApi, markNotificationAsReadApi } from '../../services/api/notificationsApi';
import type { BackendNotificationDto } from '../../services/api/types';

interface NotificationsState {
  items: BackendNotificationDto[];
  loading: boolean;
  error: string;
  hydrateNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

export const useNotifications = create<NotificationsState>((set, get) => ({
  items: [],
  loading: false,
  error: '',

  hydrateNotifications: async () => {
    set({ loading: true, error: '' });
    try {
      const items = await getMyNotificationsApi();
      set({ items, loading: false });
    } catch (error) {
      set({ loading: false, error: extractApiErrorMessage(error, 'Unable to load notifications.') });
    }
  },

  markAsRead: async (notificationId) => {
    const before = get().items;
    const nextItems = before.map((item) =>
      item.notificationID === notificationId
        ? { ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() }
        : item
    );
    set({ items: nextItems });

    try {
      await markNotificationAsReadApi(notificationId);
    } catch (error) {
      set({
        items: before,
        error: extractApiErrorMessage(error, 'Unable to mark notification as read.'),
      });
    }
  },
}));

export const selectUnreadNotificationsCount = (state: NotificationsState): number =>
  state.items.reduce((count, item) => count + (item.isRead ? 0 : 1), 0);
