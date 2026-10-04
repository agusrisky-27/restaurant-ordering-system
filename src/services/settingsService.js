import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import { MOCK_SETTINGS } from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let inMemorySettings = { ...MOCK_SETTINGS };

export const settingsService = {
  async getSettings() {
    if (USE_MOCK) {
      await delay(200);
      return { ...inMemorySettings };
    }

    return apiClient.get(API_ENDPOINTS.SETTINGS.GET);
  },

  async updateSettings(newSettings) {
    if (USE_MOCK) {
      await delay(300);
      inMemorySettings = { ...inMemorySettings, ...newSettings };
      return { ...inMemorySettings };
    }

    return apiClient.put(API_ENDPOINTS.SETTINGS.UPDATE, newSettings);
  },
};
