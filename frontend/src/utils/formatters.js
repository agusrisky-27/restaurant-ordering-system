import { ORDER_STATUS, TABLE_STATUS } from './constants';

/**
 * Format a numeric amount to a currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date time string to readable format
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date string
 */
export function formatDate(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time string
 */
export function formatTime(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Return relative time like '5m ago' or '2h ago'
 */
export function formatTimeAgo(dateInput) {
  if (!dateInput) return '';
  const now = new Date();
  const date = new Date(dateInput);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

/**
 * Get badge color variant for order status
 */
export function getOrderStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case ORDER_STATUS.PENDING:
      return 'warning';
    case ORDER_STATUS.PREPARING:
      return 'info';
    case ORDER_STATUS.READY:
      return 'purple';
    case ORDER_STATUS.COMPLETED:
      return 'success';
    case ORDER_STATUS.CANCELLED:
      return 'danger';
    default:
      return 'neutral';
  }
}

/**
 * Get badge color variant for table status
 */
export function getTableStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case TABLE_STATUS.AVAILABLE:
      return 'success';
    case TABLE_STATUS.OCCUPIED:
      return 'warning';
    case TABLE_STATUS.RESERVED:
      return 'info';
    case TABLE_STATUS.CLEANING:
      return 'danger';
    default:
      return 'neutral';
  }
}
