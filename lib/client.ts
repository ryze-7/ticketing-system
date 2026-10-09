/** Tiny fetch wrapper for client components. Throws an Error with the API's message. */
export async function api<T = unknown>(path: string, method: 'POST' | 'PATCH', body: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Something went wrong.')
  return data as T
}
