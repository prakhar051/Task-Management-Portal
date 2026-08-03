class CacheService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Fetch item from cache. Returns null if expired or missing.
   */
  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Store item in cache. Default TTL is 5 minutes (300 seconds).
   */
  async set(key, value, ttlSeconds = 300) {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiry });
    return true;
  }

  /**
   * Delete an item from the cache.
   */
  async del(key) {
    this.cache.delete(key);
    return true;
  }

  /**
   * Clear the entire cache.
   */
  async flush() {
    this.cache.clear();
    return true;
  }
}

export default new CacheService();
