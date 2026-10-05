import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  Search,
  CheckCircle,
  Flame,
  BellRing,
  ArrowRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Badge } from '../../components/common/Badge/Badge';
import { Input } from '../../components/common/Input/Input';
import { Modal } from '../../components/common/Modal/Modal';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { tableService } from '../../services/tableService';
import { ORDER_STATUS } from '../../utils/constants';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';
import './OrdersPage.css';

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');

  // New Order Modal
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [orderForm, setOrderForm] = useState({
    tableNumber: 1,
    guestCount: 2,
    notes: '',
    selectedItems: {}, // { [itemId]: quantity }
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getActiveOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenNewOrder = async () => {
    try {
      const [itemsData, tablesData] = await Promise.all([
        menuService.getItems(),
        tableService.getTables(),
      ]);
      setMenuItems(itemsData.filter((i) => i.isAvailable));
      setTables(tablesData);
      setOrderForm({
        tableNumber: 1,
        guestCount: 2,
        notes: '',
        selectedItems: {},
      });
      setIsNewOrderModalOpen(true);
    } catch (err) {
      alert('Failed to load menu items for new order');
    }
  };

  const handleAdvanceStatus = async (orderId, currentStatus, e) => {
    e.stopPropagation();
    let nextStatus;
    if (currentStatus === ORDER_STATUS.PENDING) {
      nextStatus = ORDER_STATUS.PREPARING;
    } else if (currentStatus === ORDER_STATUS.PREPARING) {
      nextStatus = ORDER_STATUS.READY;
    } else if (currentStatus === ORDER_STATUS.READY) {
      nextStatus = ORDER_STATUS.COMPLETED;
    }

    if (!nextStatus) return;

    try {
      await orderService.updateOrderStatus(orderId, nextStatus);
      await loadOrders();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleItemQuantityChange = (itemId, delta) => {
    setOrderForm((prev) => {
      const current = prev.selectedItems[itemId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev.selectedItems };
      if (next === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = next;
      }
      return { ...prev, selectedItems: updated };
    });
  };

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    const itemIds = Object.keys(orderForm.selectedItems);
    if (itemIds.length === 0) {
      alert('Please select at least one dish for the order.');
      return;
    }

    const orderItems = itemIds.map((id) => {
      const dish = menuItems.find((m) => m.id === id);
      const qty = orderForm.selectedItems[id];
      return {
        id: dish.id,
        name: dish.name,
        quantity: qty,
        unitPrice: dish.price,
        subtotal: dish.price * qty,
      };
    });

    try {
      await orderService.createOrder({
        tableNumber: Number(orderForm.tableNumber),
        guestCount: Number(orderForm.guestCount),
        notes: orderForm.notes,
        items: orderItems,
      });
      setIsNewOrderModalOpen(false);
      await loadOrders();
    } catch (err) {
      alert(`Error creating order: ${err.message}`);
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      `table ${o.tableNumber}`.includes(q) ||
      (o.server && o.server.toLowerCase().includes(q))
    );
  });

  const pendingOrders = filteredOrders.filter((o) => o.status === ORDER_STATUS.PENDING);
  const preparingOrders = filteredOrders.filter((o) => o.status === ORDER_STATUS.PREPARING);
  const readyOrders = filteredOrders.filter((o) => o.status === ORDER_STATUS.READY);

  // New Order modal calculations
  const modalSubtotal = Object.entries(orderForm.selectedItems).reduce(
    (sum, [id, qty]) => {
      const item = menuItems.find((m) => m.id === id);
      return sum + (item ? item.price * qty : 0);
    },
    0
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Active Orders Pipeline</h1>
          <p className="page-subtitle">Track incoming tickets, kitchen cook line, and ready-to-serve dishes.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleOpenNewOrder}
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="orders-toolbar">
        <div className="orders-search">
          <Input
            placeholder="Search order number or table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <div className="orders-view-toggles">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'kanban' ? 'is-active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            Kanban Board
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'list' ? 'is-active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="kanban-columns-grid">
          {/* Column 1: Incoming / Pending */}
          <div className="kanban-column">
            <div className="kanban-col-header pending-header">
              <div className="col-header-title">
                <Clock size={16} />
                <span>INCOMING</span>
              </div>
              <span className="col-count-pill">{pendingOrders.length}</span>
            </div>

            <div className="kanban-cards-stack">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="kanban-order-card"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="kcard-header">
                    <div className="kcard-table">Table {order.tableNumber}</div>
                    <span className="kcard-time">{formatTimeAgo(order.createdAt)}</span>
                  </div>

                  <div className="kcard-ordernum">{order.orderNumber}</div>

                  <div className="kcard-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="kcard-item-line">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="kcard-notes">“{order.notes}”</div>
                  )}

                  <div className="kcard-footer">
                    <span className="kcard-total">{formatCurrency(order.total)}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight size={14} />}
                      onClick={(e) =>
                        handleAdvanceStatus(order.id, order.status, e)
                      }
                    >
                      Cook Line
                    </Button>
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="kanban-empty-col">No incoming tickets</div>
              )}
            </div>
          </div>

          {/* Column 2: In Kitchen / Preparing */}
          <div className="kanban-column">
            <div className="kanban-col-header preparing-header">
              <div className="col-header-title">
                <Flame size={16} />
                <span>IN KITCHEN</span>
              </div>
              <span className="col-count-pill">{preparingOrders.length}</span>
            </div>

            <div className="kanban-cards-stack">
              {preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className="kanban-order-card in-kitchen"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="kcard-header">
                    <div className="kcard-table">Table {order.tableNumber}</div>
                    <span className="kcard-time cooking-time">
                      <Flame size={13} /> {formatTimeAgo(order.createdAt)}
                    </span>
                  </div>

                  <div className="kcard-ordernum">{order.orderNumber}</div>

                  <div className="kcard-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="kcard-item-line">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                        {item.notes && <span className="item-note">({item.notes})</span>}
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="kcard-notes">“{order.notes}”</div>
                  )}

                  <div className="kcard-footer">
                    <span className="kcard-total">{formatCurrency(order.total)}</span>
                    <Button
                      variant="success"
                      size="sm"
                      rightIcon={<BellRing size={14} />}
                      onClick={(e) =>
                        handleAdvanceStatus(order.id, order.status, e)
                      }
                    >
                      Dish Ready
                    </Button>
                  </div>
                </div>
              ))}
              {preparingOrders.length === 0 && (
                <div className="kanban-empty-col">Kitchen queue clear</div>
              )}
            </div>
          </div>

          {/* Column 3: Ready to Serve */}
          <div className="kanban-column">
            <div className="kanban-col-header ready-header">
              <div className="col-header-title">
                <BellRing size={16} />
                <span>READY TO SERVE</span>
              </div>
              <span className="col-count-pill">{readyOrders.length}</span>
            </div>

            <div className="kanban-cards-stack">
              {readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="kanban-order-card is-ready"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="kcard-header">
                    <div className="kcard-table ready-table">
                      Table {order.tableNumber}
                    </div>
                    <span className="kcard-time">{formatTimeAgo(order.createdAt)}</span>
                  </div>

                  <div className="kcard-ordernum">{order.orderNumber}</div>

                  <div className="kcard-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="kcard-item-line">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="kcard-footer">
                    <span className="kcard-total">{formatCurrency(order.total)}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<CheckCircle size={14} />}
                      onClick={(e) =>
                        handleAdvanceStatus(order.id, order.status, e)
                      }
                    >
                      Complete & Pay
                    </Button>
                  </div>
                </div>
              ))}
              {readyOrders.length === 0 && (
                <div className="kanban-empty-col">No ready dishes pending runner</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="orders-table-wrapper">
          <table className="orders-data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Table</th>
                <th>Status</th>
                <th>Items</th>
                <th>Server</th>
                <th>Elapsed</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="clickable-row"
                >
                  <td className="font-bold">{order.orderNumber}</td>
                  <td>Table {order.tableNumber}</td>
                  <td>
                    <Badge
                      variant={
                        order.status === 'pending'
                          ? 'warning'
                          : order.status === 'preparing'
                          ? 'info'
                          : 'purple'
                      }
                      dot
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td>{order.items.length} items</td>
                  <td>{order.server || 'Floor Server'}</td>
                  <td>{formatTimeAgo(order.createdAt)}</td>
                  <td className="font-bold">{formatCurrency(order.total)}</td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}`);
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Order Modal */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="Create New Dine-In Order"
        size="md"
        footer={
          <div className="new-order-modal-footer">
            <div className="modal-total-display">
              <span>Estimated Subtotal:</span>
              <strong>{formatCurrency(modalSubtotal)}</strong>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsNewOrderModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateOrderSubmit}>
                Send to Kitchen
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleCreateOrderSubmit} className="new-order-form">
          <div className="form-two-cols">
            <div className="input-group">
              <label className="input-label">Select Table</label>
              <select
                className="input-control"
                value={orderForm.tableNumber}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, tableNumber: e.target.value })
                }
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.number}>
                    Table {t.number} ({t.capacity} seats - {t.zone})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Guest Count"
              type="number"
              min="1"
              max="20"
              value={orderForm.guestCount}
              onChange={(e) =>
                setOrderForm({ ...orderForm, guestCount: e.target.value })
              }
              required
            />
          </div>

          <Input
            label="Special Kitchen Notes / Allergies"
            placeholder="e.g. Nut allergy, pace courses slowly"
            value={orderForm.notes}
            onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
          />

          <div className="new-order-dish-picker">
            <label className="input-label">Select Dishes</label>
            <div className="dish-picker-list">
              {menuItems.map((dish) => {
                const qty = orderForm.selectedItems[dish.id] || 0;
                return (
                  <div key={dish.id} className="dish-picker-item">
                    <div className="picker-dish-info">
                      <span className="picker-dish-name">{dish.name}</span>
                      <span className="picker-dish-price">
                        {formatCurrency(dish.price)}
                      </span>
                    </div>
                    <div className="picker-qty-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleItemQuantityChange(dish.id, -1)}
                        disabled={qty === 0}
                      >
                        -
                      </button>
                      <span className="qty-number">{qty}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleItemQuantityChange(dish.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
