const cache = new Map<string, { data: unknown; expiry: number }>();
const MAX_CACHE_SIZE = 200;

export function requestCache<T>(key: string, fn: () => Promise<T>, ttlMs = 5000): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiry > now) {
    return cached.data as Promise<T>;
  }

  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  const promise = fn().then((data) => {
    cache.set(key, { data, expiry: now + ttlMs });
    return data;
  });

  cache.set(key, { data: promise, expiry: now + ttlMs });
  return promise;
}

export function clearRequestCache() {
  cache.clear();
}

export function invalidateRequestCache(key: string) {
  cache.delete(key);
}
