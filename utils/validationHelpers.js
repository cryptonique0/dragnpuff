/**
 * Utility: Validation Helpers
 * Common validation functions
 */

export const isEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const isPhoneNumber = (phone) => {
  const regex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

export const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};

export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const isPositive = (value) => {
  return isNumber(value) && parseFloat(value) > 0;
};

export const isBetween = (value, min, max) => {
  return isNumber(value) && value >= min && value <= max;
};

export const hasMinLength = (str, length) => {
  return typeof str === 'string' && str.length >= length;
};

export const hasMaxLength = (str, length) => {
  return typeof str === 'string' && str.length <= length;
};
