import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import { MOCK_DASHBOARD_STATS } from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  async getDashboardStats() {
    if (USE_MOCK) {
      await delay(200);
      return { ...MOCK_DASHBOARD_STATS };
    }

    return apiClient.get(API_ENDPOINTS.DASHBOARD.STATS);
  },
};
