/**
 * Utility: Storage Helpers
 * Browser localStorage and sessionStorage utilities
 */

const PREFIX = 'dragnpuff_';

export const setItem = (key, value, storage = 'local') => {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage;
    const serialized = JSON.stringify(value);
    store.setItem(`${PREFIX}${key}`, serialized);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

export const getItem = (key, storage = 'local') => {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage;
    const item = store.getItem(`${PREFIX}${key}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Storage error:', error);
    return null;
  }
};

export const removeItem = (key, storage = 'local') => {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage;
    store.removeItem(`${PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

export const clear = (storage = 'local') => {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage;
    const keys = Object.keys(store).filter(k => k.startsWith(PREFIX));
    keys.forEach(key => store.removeItem(key));
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

export const setWithExpiry = (key, value, expiryMs, storage = 'local') => {
  const item = {
    value,
    expiry: Date.now() + expiryMs
  };
  return setItem(key, item, storage);
};

export const getWithExpiry = (key, storage = 'local') => {
  const item = getItem(key, storage);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    removeItem(key, storage);
    return null;
  }

  return item.value;
};

export const getAllItems = (storage = 'local') => {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage;
    const items = {};
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key.startsWith(PREFIX)) {
        const cleanKey = key.replace(PREFIX, '');
        items[cleanKey] = getItem(cleanKey, storage);
      }
    }
    return items;
  } catch (error) {
    console.error('Storage error:', error);
    return {};
  }
};
