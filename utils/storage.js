/**
 * Storage Abstraction Layer
 */

class Storage {
  constructor(backend = "memory") {
    this.backend = backend;
    this.data = new Map();
  }

  async set(key, value, ttl = null) {
    this.data.set(key, { value, expiry: ttl ? Date.now() + ttl : null });
  }

  async get(key) {
    const item = this.data.get(key);
    if (!item) return null;

    if (item.expiry && item.expiry < Date.now()) {
      this.data.delete(key);
      return null;
    }

    return item.value;
  }

  async delete(key) {
    this.data.delete(key);
  }

  async clear() {
    this.data.clear();
  }

  async exists(key) {
    return (await this.get(key)) !== null;
  }

  async keys() {
    return Array.from(this.data.keys());
  }
}

function createStorage(backend = "memory") {
  return new Storage(backend);
}

module.exports = {
  Storage,
  createStorage,
};
