import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import { MOCK_TABLES } from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let inMemoryTables = [...MOCK_TABLES];

export const tableService = {
  async getTables(filters = {}) {
    if (USE_MOCK) {
      await delay(200);
      let tables = [...inMemoryTables];

      if (filters.zone && filters.zone !== 'all') {
        tables = tables.filter((t) => t.zone === filters.zone);
      }

      if (filters.status && filters.status !== 'all') {
        tables = tables.filter((t) => t.status === filters.status);
      }

      return tables;
    }

    return apiClient.get(API_ENDPOINTS.TABLES.LIST, { params: filters });
  },

  async getTableById(id) {
    if (USE_MOCK) {
      await delay(150);
      const table = inMemoryTables.find((t) => t.id === id);
      if (!table) throw new Error('Table not found');
      return table;
    }

    return apiClient.get(API_ENDPOINTS.TABLES.DETAIL(id));
  },

  async updateTableStatus(id, newStatus, additionalData = {}) {
    if (USE_MOCK) {
      await delay(250);
      const index = inMemoryTables.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Table not found');

      inMemoryTables[index] = {
        ...inMemoryTables[index],
        status: newStatus,
        ...additionalData,
        seatedAt: newStatus === 'occupied' ? new Date().toISOString() : null,
      };

      return inMemoryTables[index];
    }

    return apiClient.patch(API_ENDPOINTS.TABLES.UPDATE_STATUS(id), {
      status: newStatus,
      ...additionalData,
    });
  },
};
