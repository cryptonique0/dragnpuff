/**
 * Caching Utility
 */

class Cache {
  constructor(ttl = 60000) {
    this.ttl = ttl;
    this.store = new Map();
  }

  set(key, value, ttl = null) {
    const expiry = (ttl || this.ttl) + Date.now();
    this.store.set(key, { value, expiry });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

function createCache(ttl = 60000) {
  return new Cache(ttl);
}

module.exports = {
  Cache,
  createCache,
};
