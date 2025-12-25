/**
 * Utility: String Helpers
 * Common string manipulation functions
 */

export const truncateAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const truncateString = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export const toUpperCase = (str) => str?.toUpperCase() || '';

export const toLowerCase = (str) => str?.toLowerCase() || '';

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const removeSpecialChars = (str) => {
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const toPascalCase = (str) => {
  return str
    .split(/[\s_-]/g)
    .map(word => capitalizeFirst(word))
    .join('');
};

export const toCamelCase = (str) => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};
