import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import { MOCK_USERS } from './mockData';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Helper for simulating network latency in mock mode
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  /**
   * Authenticate user with email and password
   */
  async login({ email, password, rememberMe = false }) {
    if (USE_MOCK) {
      await delay(600);

      const user = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!user) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      if (user.password !== password) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;
      const authData = {
        token: mockToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          restaurantName: user.restaurantName,
        },
      };

      storage.set(STORAGE_KEYS.AUTH_TOKEN, authData.token);
      storage.set(STORAGE_KEYS.AUTH_USER, authData.user);

      if (rememberMe) {
        storage.set(STORAGE_KEYS.REMEMBER_EMAIL, email);
      } else {
        storage.remove(STORAGE_KEYS.REMEMBER_EMAIL);
      }

      return authData;
    }

    // Real API implementation
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    if (response?.token) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.AUTH_USER, response.user);
    }
    return response;
  },

  /**
   * Log out current user
   */
  async logout() {
    if (USE_MOCK) {
      await delay(200);
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.AUTH_USER);
      return { success: true };
    }

    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.AUTH_USER);
    }
  },

  /**
   * Get current authenticated user session
   */
  getCurrentUser() {
    return storage.get(STORAGE_KEYS.AUTH_USER, null);
  },

  /**
   * Check if token is present
   */
  isAuthenticated() {
    return Boolean(storage.get(STORAGE_KEYS.AUTH_TOKEN));
  },
};
