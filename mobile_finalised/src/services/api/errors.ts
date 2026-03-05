import axios from 'axios';
import type { BackendErrorResponse } from './types';

export interface NormalizedApiError {
  message: string;
  status?: number;
  payload?: BackendErrorResponse | string;
}

export function normalizeApiError(error: unknown, fallback: string): NormalizedApiError {
  if (!axios.isAxiosError(error)) {
    return { message: fallback };
  }

  const payload = error.response?.data as BackendErrorResponse | string | undefined;
  const status = error.response?.status;

  if (typeof payload === 'string' && payload.trim()) {
    return { message: payload, status, payload };
  }

  if (payload && typeof payload === 'object') {
    const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    return {
      message: payload.message || payload.detail || payload.title || firstError || fallback,
      status,
      payload,
    };
  }

  return { message: fallback, status, payload };
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  return normalizeApiError(error, fallback).message;
}
