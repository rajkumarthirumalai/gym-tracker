/**
 * Safe fetch wrapper — returns null on non-ok responses or parse errors.
 * Prevents "Unexpected end of JSON input" when API is down (no DB connected).
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Safe POST — returns { data, error } so callers can inspect both.
 */
export async function safePost<T>(
  url: string,
  body: unknown
): Promise<{ data: T | null; ok: boolean; status?: number }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? (JSON.parse(text) as T) : null;
    return { data, ok: res.ok, status: res.status };
  } catch {
    return { data: null, ok: false };
  }
}

/**
 * Safe PATCH
 */
export async function safePatch<T>(
  url: string,
  body: unknown
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}
