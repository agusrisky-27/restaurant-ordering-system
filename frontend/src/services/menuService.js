import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import { MOCK_MENU_ITEMS } from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

let inMemoryMenu = [...MOCK_MENU_ITEMS];

export const menuService = {
  async getItems(filters = {}) {
    if (USE_MOCK) {
      await delay(250);
      let items = [...inMemoryMenu];

      if (filters.category && filters.category !== 'all') {
        items = items.filter((item) => item.category === filters.category);
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
      }

      if (filters.status === 'in_stock') {
        items = items.filter((item) => item.isAvailable);
      } else if (filters.status === 'out_of_stock') {
        items = items.filter((item) => !item.isAvailable);
      }

      return items;
    }

    return apiClient.get(API_ENDPOINTS.MENU.LIST, { params: filters });
  },

  async getItemById(id) {
    if (USE_MOCK) {
      await delay(150);
      const item = inMemoryMenu.find((i) => i.id === id);
      if (!item) throw new Error('Menu item not found');
      return item;
    }

    return apiClient.get(API_ENDPOINTS.MENU.DETAIL(id));
  },

  async createItem(itemData) {
    if (USE_MOCK) {
      await delay(300);
      const newItem = {
        ...itemData,
        id: `item-${Date.now()}`,
        isAvailable: itemData.isAvailable ?? true,
      };
      inMemoryMenu.unshift(newItem);
      return newItem;
    }

    return apiClient.post(API_ENDPOINTS.MENU.CREATE, itemData);
  },

  async updateItem(id, itemData) {
    if (USE_MOCK) {
      await delay(250);
      const index = inMemoryMenu.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Menu item not found');
      inMemoryMenu[index] = { ...inMemoryMenu[index], ...itemData };
      return inMemoryMenu[index];
    }

    return apiClient.put(API_ENDPOINTS.MENU.UPDATE(id), itemData);
  },

  async toggleAvailability(id) {
    if (USE_MOCK) {
      await delay(150);
      const item = inMemoryMenu.find((i) => i.id === id);
      if (!item) throw new Error('Menu item not found');
      item.isAvailable = !item.isAvailable;
      return item;
    }

    return apiClient.patch(`${API_ENDPOINTS.MENU.DETAIL(id)}/availability`);
  },

  async deleteItem(id) {
    if (USE_MOCK) {
      await delay(200);
      inMemoryMenu = inMemoryMenu.filter((i) => i.id !== id);
      return { success: true };
    }

    return apiClient.delete(API_ENDPOINTS.MENU.DELETE(id));
  },
};
