/**
 * Safe LocalStorage abstraction
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing localStorage key "${key}":`, e);
    }
  },

  clear() {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
  },
};
