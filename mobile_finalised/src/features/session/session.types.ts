export type SessionStatus = 'idle' | 'running' | 'paused';

export interface ActiveSessionState {
  status: SessionStatus;
  gymId: string | null;
  sessionId: string | null;
  sessionStartAt: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
}

export type PersistedActiveSessionState = Pick<
  ActiveSessionState,
  'status' | 'gymId' | 'sessionId' | 'sessionStartAt' | 'pausedAt' | 'totalPausedMs'
>;

export interface StartSessionPayload {
  gymId: string;
  sessionId?: string;
}
