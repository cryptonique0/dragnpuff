/**
 * Utility: Number Helpers
 * Common number manipulation and formatting functions
 */

export const formatCurrency = (value, currency = 'USD', decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatNumber = (value, decimals = 2) => {
  return parseFloat(value).toFixed(decimals);
};

export const abbreviateNumber = (value) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
};

export const percentageChange = (oldValue, newValue) => {
  const change = ((newValue - oldValue) / oldValue) * 100;
  return change.toFixed(2);
};

export const toWei = (value, decimals = 18) => {
  return (parseFloat(value) * Math.pow(10, decimals)).toString();
};

export const fromWei = (value, decimals = 18) => {
  return (parseFloat(value) / Math.pow(10, decimals)).toString();
};

export const roundUp = (value, decimals = 2) => {
  return Math.ceil(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const roundDown = (value, decimals = 2) => {
  return Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};
