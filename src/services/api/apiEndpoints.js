/**
 * Centralized API Endpoints Map
 * Any change to backend routes only needs to be updated here.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    POPULAR_ITEMS: '/dashboard/popular-items',
  },
  MENU: {
    LIST: '/menu',
    CATEGORIES: '/menu/categories',
    DETAIL: (id) => `/menu/${id}`,
    CREATE: '/menu',
    UPDATE: (id) => `/menu/${id}`,
    DELETE: (id) => `/menu/${id}`,
  },
  TABLES: {
    LIST: '/tables',
    DETAIL: (id) => `/tables/${id}`,
    UPDATE_STATUS: (id) => `/tables/${id}/status`,
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    HISTORY: '/orders/history',
  },
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
};
