import dayjs from "dayjs";

export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

/**
 * Formats a date string or Date object into a localized date string
 * @param {string|Date} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', mergedOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - ISO currency code (default: 'USD')
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  if (amount === null || amount === undefined) return '$0.00';
  
  const defaultOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.NumberFormat('en-US', mergedOptions).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Formats a number with commas
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(number);
};

export default {
  formatDate,
  formatCurrency,
  formatNumber,
};

