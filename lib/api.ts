import { API } from './catalog';

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

/** Calls the shop backend from the browser. The login cookie (HttpOnly, .adrenl.com) rides along. */
export async function api<T>(path: string, body?: unknown): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${API}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'No connection. Check your internet and try again.');
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(r.status, j.error || 'Something went wrong. Please try again.');
  return j as T;
}
