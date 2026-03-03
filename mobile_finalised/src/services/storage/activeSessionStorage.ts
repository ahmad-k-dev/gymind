import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedActiveSessionState, SessionStatus } from '../../features/session/session.types';

const ACTIVE_SESSION_STORAGE_KEY = 'active_session_v1';

const VALID_STATUS: ReadonlyArray<SessionStatus> = ['idle', 'running', 'paused'];

function isValidStatus(value: unknown): value is SessionStatus {
  return typeof value === 'string' && VALID_STATUS.includes(value as SessionStatus);
}

function isValidNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isValidNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isPersistedActiveSessionState(value: unknown): value is PersistedActiveSessionState {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    isValidStatus(candidate.status) &&
    isValidNullableString(candidate.gymId) &&
    isValidNullableString(candidate.sessionId) &&
    isValidNullableNumber(candidate.sessionStartAt) &&
    isValidNullableNumber(candidate.pausedAt) &&
    isValidNumber(candidate.totalPausedMs)
  );
}

export async function loadActiveSessionState(): Promise<PersistedActiveSessionState | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedActiveSessionState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveActiveSessionState(state: PersistedActiveSessionState): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(state));
}

export async function clearActiveSessionState(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}
