// ============================================================
// API client wrapper — attaches Firebase ID token to every call.
// Every protected /api/* route expects Authorization: Bearer <jwt>.
// ============================================================

import { getIdToken } from '@/lib/firebase/auth';

export interface ApiCallResult<T = unknown> {
  ok: boolean;
  status: number;
  body: T | { success: false; error: string; code?: string; matched?: string };
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiCallResult<T>> {
  const token = await getIdToken();
  const headers = new Headers(init.headers ?? {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(path, { ...init, headers });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = { success: false, error: 'Response bukan JSON' };
  }
  return { ok: response.ok, status: response.status, body: body as T };
}
