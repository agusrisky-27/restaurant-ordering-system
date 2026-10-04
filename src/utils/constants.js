export const APP_CONFIG = {
  NAME: 'Savory Bistro POS',
  VERSION: '1.0.0',
  DEFAULT_CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Incoming',
  [ORDER_STATUS.PREPARING]: 'In Kitchen',
  [ORDER_STATUS.READY]: 'Ready to Serve',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
};

export const TABLE_STATUS_LABELS = {
  [TABLE_STATUS.AVAILABLE]: 'Available',
  [TABLE_STATUS.OCCUPIED]: 'Occupied',
  [TABLE_STATUS.RESERVED]: 'Reserved',
  [TABLE_STATUS.CLEANING]: 'Cleaning',
};

export const TABLE_ZONES = [
  { id: 'all', label: 'All Areas' },
  { id: 'main', label: 'Main Dining' },
  { id: 'patio', label: 'Outdoor Patio' },
  { id: 'bar', label: 'Bar Lounge' },
  { id: 'vip', label: 'VIP Room' },
];

export const MENU_CATEGORIES = [
  { id: 'all', label: 'All Items', icon: 'Utensils' },
  { id: 'starters', label: 'Starters', icon: 'Soup' },
  { id: 'mains', label: 'Main Courses', icon: 'Beef' },
  { id: 'desserts', label: 'Desserts', icon: 'Cake' },
  { id: 'beverages', label: 'Beverages', icon: 'Coffee' },
  { id: 'specials', label: 'Chef Specials', icon: 'Sparkles' },
];

export const PAYMENT_METHODS = {
  CASH: 'Cash',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  QR_CODE: 'Digital Pay / QR',
};

export const USER_ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  WAITER: 'Server',
  CHEF: 'Kitchen Chef',
  CASHIER: 'Cashier',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'restaurant_pos_token',
  AUTH_USER: 'restaurant_pos_user',
  REMEMBER_EMAIL: 'restaurant_pos_remember_email',
  THEME_PREFERENCES: 'restaurant_pos_theme',
};
