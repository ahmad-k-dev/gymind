import { create } from 'zustand';
import {
  clearActiveSessionState,
  loadActiveSessionState,
  saveActiveSessionState,
} from '../../services/storage/activeSessionStorage';
import { checkInApi, checkOutApi } from '../../services/api/sessionApi';
import type {
  ActiveSessionState,
  PersistedActiveSessionState,
  SessionStatus,
  StartSessionPayload,
} from './session.types';

type SessionSyncStatus = 'idle' | 'syncing' | 'synced' | 'local_only' | 'error';

interface ActiveSessionStore extends ActiveSessionState {
  syncStatus: SessionSyncStatus;
  startSession: (payload: StartSessionPayload) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  resetSession: () => void;
  hydrateActiveSession: () => Promise<void>;
  beginCheckIn: (payload: { gymBranchId: string; latitude: number; longitude: number }) => Promise<void>;
  finalizeCheckOut: () => Promise<void>;
}

const initialState: ActiveSessionState = {
  status: 'idle',
  gymId: null,
  sessionId: null,
  sessionStartAt: null,
  pausedAt: null,
  totalPausedMs: 0,
};

function toPersistedState(state: ActiveSessionState): PersistedActiveSessionState {
  return {
    status: state.status,
    gymId: state.gymId,
    sessionId: state.sessionId,
    sessionStartAt: state.sessionStartAt,
    pausedAt: state.pausedAt,
    totalPausedMs: state.totalPausedMs,
  };
}

export function computeElapsedMs(state: ActiveSessionState, nowMs: number = Date.now()): number {
  if (!state.sessionStartAt) return 0;

  const pausedDeltaMs =
    state.status === 'paused' && state.pausedAt ? Math.max(nowMs - state.pausedAt, 0) : 0;

  const elapsedMs = nowMs - state.sessionStartAt - state.totalPausedMs - pausedDeltaMs;
  return Math.max(elapsedMs, 0);
}

export const useActiveSession = create<ActiveSessionStore>((set, get) => ({
  ...initialState,
  syncStatus: 'idle',

  startSession: ({ gymId, sessionId }) => {
    const nextState: ActiveSessionState = {
      status: 'running',
      gymId,
      sessionId: sessionId ?? null,
      sessionStartAt: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
    };

    set(nextState);
    void saveActiveSessionState(toPersistedState(nextState));
  },

  pauseSession: () => {
    const current = get();
    if (current.status !== 'running' || !current.sessionStartAt) return;

    const nextState: ActiveSessionState = {
      ...current,
      status: 'paused',
      pausedAt: Date.now(),
    };

    set(nextState);
    void saveActiveSessionState(toPersistedState(nextState));
  },

  resumeSession: () => {
    const current = get();
    if (current.status !== 'paused' || !current.pausedAt || !current.sessionStartAt) return;

    const now = Date.now();
    const resumedPausedMs = Math.max(now - current.pausedAt, 0);
    const nextState: ActiveSessionState = {
      ...current,
      status: 'running',
      pausedAt: null,
      totalPausedMs: current.totalPausedMs + resumedPausedMs,
    };

    set(nextState);
    void saveActiveSessionState(toPersistedState(nextState));
  },

  stopSession: () => {
    const current = get();
    if (!current.sessionStartAt || (current.status !== 'running' && current.status !== 'paused')) {
      return;
    }

    set({ ...initialState, syncStatus: 'idle' });
    void clearActiveSessionState();
  },

  resetSession: () => {
    set({ ...initialState, syncStatus: 'idle' });
    void clearActiveSessionState();
  },

  hydrateActiveSession: async () => {
    const stored = await loadActiveSessionState();
    if (!stored) return;

    if (stored.status === 'running' || stored.status === 'paused') {
      const hydrated: ActiveSessionState = {
        status: stored.status,
        gymId: stored.gymId,
        sessionId: stored.sessionId,
        sessionStartAt: stored.sessionStartAt,
        pausedAt: stored.pausedAt,
        totalPausedMs: stored.totalPausedMs,
      };
      set(hydrated);
      return;
    }

    set(initialState);
  },

  beginCheckIn: async ({ gymBranchId, latitude, longitude }) => {
    set({ syncStatus: 'syncing' });
    try {
      await checkInApi({ GymBranchID: gymBranchId, Latitude: latitude, Longitude: longitude });
      set({ syncStatus: 'synced' });
    } catch {
      set({ syncStatus: 'local_only' });
    }
  },

  finalizeCheckOut: async () => {
    set({ syncStatus: 'syncing' });
    try {
      await checkOutApi();
      set({ syncStatus: 'synced' });
    } catch {
      set({ syncStatus: 'error' });
      throw new Error('Checkout sync failed');
    }
  },
}));

export const selectSessionStatus = (state: ReturnType<typeof useActiveSession.getState>): SessionStatus =>
  state.status;

export const selectElapsedMs = (
  state: ReturnType<typeof useActiveSession.getState>,
  nowMs: number = Date.now()
): number => computeElapsedMs(state, nowMs);

export const selectIsSessionActive = (state: ReturnType<typeof useActiveSession.getState>): boolean =>
  state.status === 'running' || state.status === 'paused';
