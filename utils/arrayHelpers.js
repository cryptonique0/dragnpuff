/**
 * Utility: Array Helpers
 * Common array manipulation functions
 */

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = (array) => {
  return [...new Set(array)];
};

export const uniqueBy = (array, key) => {
  return array.reduce((acc, item) => {
    if (!acc.find(i => i[key] === item[key])) {
      acc.push(item);
    }
    return acc;
  }, []);
};

export const flatten = (array) => {
  return array.reduce((acc, val) => acc.concat(val), []);
};

export const groupBy = (array, key) => {
  return array.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
};

export const sortBy = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    if (ascending) return a[key] > b[key] ? 1 : -1;
    return a[key] < b[key] ? 1 : -1;
  });
};

export const findDuplicates = (array) => {
  return array.filter((item, index) => array.indexOf(item) !== index);
};

export const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const sum = (array, key = null) => {
  return array.reduce((acc, item) => acc + (key ? item[key] : item), 0);
};

export const average = (array, key = null) => {
  const total = sum(array, key);
  return total / array.length;
};

export const max = (array, key = null) => {
  return Math.max(...array.map(item => key ? item[key] : item));
};

export const min = (array, key = null) => {
  return Math.min(...array.map(item => key ? item[key] : item));
};
