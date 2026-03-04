import axios from 'axios';
import type { BackendErrorResponse } from './types';

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as BackendErrorResponse | string | undefined;

  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (data.message) return data.message;
    if (data.detail) return data.detail;
    if (data.title) return data.title;

    const firstError = data.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    if (firstError) return firstError;
  }

  return fallback;
}
