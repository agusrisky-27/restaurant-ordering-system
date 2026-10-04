import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import { MOCK_ACTIVE_ORDERS, MOCK_ORDER_HISTORY } from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

let inMemoryActiveOrders = [...MOCK_ACTIVE_ORDERS];
let inMemoryHistory = [...MOCK_ORDER_HISTORY];

export const orderService = {
  async getActiveOrders(filters = {}) {
    if (USE_MOCK) {
      await delay(250);
      let orders = [...inMemoryActiveOrders];

      if (filters.status && filters.status !== 'all') {
        orders = orders.filter((o) => o.status === filters.status);
      }

      if (filters.zone && filters.zone !== 'all') {
        orders = orders.filter((o) => o.zone === filters.zone);
      }

      return orders;
    }

    return apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params: filters });
  },

  async getOrderById(id) {
    if (USE_MOCK) {
      await delay(180);
      // Check active orders first
      let order = inMemoryActiveOrders.find((o) => o.id === id);
      if (!order) {
        // Check order history
        order = inMemoryHistory.find((o) => o.id === id);
      }

      if (!order) {
        // Return a mock detailed order if id doesn't match directly
        order = inMemoryActiveOrders[0];
      }
      return order;
    }

    return apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(id));
  },

  async updateOrderStatus(orderId, nextStatus) {
    if (USE_MOCK) {
      await delay(250);
      const orderIndex = inMemoryActiveOrders.findIndex((o) => o.id === orderId);

      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      const order = inMemoryActiveOrders[orderIndex];
      order.status = nextStatus;

      // If marked completed or cancelled, move to history
      if (nextStatus === 'completed' || nextStatus === 'cancelled') {
        const historyRecord = {
          ...order,
          completedAt: new Date().toISOString(),
          paymentStatus: nextStatus === 'completed' ? 'paid' : 'void',
          paymentMethod: 'Credit Card',
          itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
        };
        inMemoryHistory.unshift(historyRecord);
        inMemoryActiveOrders.splice(orderIndex, 1);
        return historyRecord;
      }

      return order;
    }

    return apiClient.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), { status: nextStatus });
  },

  async getOrderHistory(filters = {}) {
    if (USE_MOCK) {
      await delay(250);
      let history = [...inMemoryHistory];

      if (filters.search) {
        const query = filters.search.toLowerCase();
        history = history.filter(
          (o) =>
            o.id.toLowerCase().includes(query) ||
            o.orderNumber.toLowerCase().includes(query) ||
            (o.server && o.server.toLowerCase().includes(query))
        );
      }

      if (filters.status && filters.status !== 'all') {
        history = history.filter((o) => o.status === filters.status);
      }

      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        history = history.filter((o) => o.paymentMethod === filters.paymentMethod);
      }

      return history;
    }

    return apiClient.get(API_ENDPOINTS.ORDERS.HISTORY, { params: filters });
  },

  async createOrder(orderPayload) {
    if (USE_MOCK) {
      await delay(350);
      const subtotal = orderPayload.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const tax = Number((subtotal * 0.08).toFixed(2));
      const serviceCharge = Number((subtotal * 0.1).toFixed(2));
      const total = Number((subtotal + tax + serviceCharge).toFixed(2));

      const newOrder = {
        id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
        orderNumber: `#${Math.floor(100 + Math.random() * 900)}`,
        tableId: orderPayload.tableId || 'T-01',
        tableNumber: orderPayload.tableNumber || 1,
        zone: orderPayload.zone || 'main',
        type: orderPayload.type || 'Dine-In',
        status: 'pending',
        server: orderPayload.server || 'Server',
        guestCount: orderPayload.guestCount || 2,
        createdAt: new Date().toISOString(),
        notes: orderPayload.notes || '',
        items: orderPayload.items,
        subtotal,
        tax,
        serviceCharge,
        total,
        paymentStatus: 'unpaid',
      };

      inMemoryActiveOrders.unshift(newOrder);
      return newOrder;
    }

    return apiClient.post(API_ENDPOINTS.ORDERS.CREATE, orderPayload);
  },
};
