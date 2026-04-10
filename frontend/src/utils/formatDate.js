import { format, parseISO, isValid } from 'date-fns';

/**
 * Format an ISO date string to a human-readable format.
 * @param {string} dateStr - ISO date string
 * @param {string} fmt - date-fns format string
 */
export const formatDate = (dateStr, fmt = 'dd MMM yyyy') => {
  if (!dateStr) return 'Date TBD';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, fmt);
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => formatDate(dateStr, 'dd MMM yyyy · h:mm a');

export const formatRelative = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Past event';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
};
