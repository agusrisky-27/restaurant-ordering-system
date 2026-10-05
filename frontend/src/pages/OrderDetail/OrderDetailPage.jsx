import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  Clock,
  Flame,
  BellRing,
  User,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Badge } from '../../components/common/Badge/Badge';
import { Card } from '../../components/common/Card/Card';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusVariant } from '../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import './OrderDetailPage.css';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (nextStatus) => {
    try {
      const updated = await orderService.updateOrderStatus(order.id, nextStatus);
      setOrder(updated);
    } catch (err) {
      alert(`Error updating order status: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading-state">
          <div className="btn-spinner" style={{ width: 28, height: 28 }} />
          <p>Loading order ticket...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <div className="empty-state-card">
          <AlertCircle size={40} className="empty-icon" />
          <h3>Order Not Found</h3>
          <p>The requested order ticket does not exist.</p>
          <Button variant="primary" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in printable-area">
      {/* Back button and actions */}
      <div className="order-detail-header-bar no-print">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer size={16} />}
            onClick={handlePrint}
          >
            Print Ticket / Receipt
          </Button>
          {order.status === 'pending' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Flame size={16} />}
              onClick={() => handleStatusChange('preparing')}
            >
              Start Kitchen Preparation
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              variant="success"
              size="sm"
              leftIcon={<BellRing size={16} />}
              onClick={() => handleStatusChange('ready')}
            >
              Mark Food Ready
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCircle size={16} />}
              onClick={() => handleStatusChange('completed')}
            >
              Close & Mark Paid
            </Button>
          )}
        </div>
      </div>

      <div className="order-detail-layout">
        {/* Left Column: Bill & Itemization */}
        <div className="order-detail-left">
          <Card className="receipt-card">
            <div className="receipt-header">
              <div className="receipt-brand">
                <span className="brand-logo-text">🍽️ Savory Kitchen & Bistro</span>
                <span className="receipt-pos-tag">KITCHEN DISPLAY & POS RECEIPT</span>
              </div>
              <div className="receipt-order-meta">
                <div className="receipt-num">{order.orderNumber}</div>
                <Badge variant={getOrderStatusVariant(order.status)} size="md" dot>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </Badge>
              </div>
            </div>

            {/* Quick table details */}
            <div className="receipt-info-strip">
              <div className="info-chip">
                <MapPin size={14} />
                <span>
                  Table {order.tableNumber} ({order.zone || 'Main Dining'})
                </span>
              </div>
              <div className="info-chip">
                <User size={14} />
                <span>Server: {order.server || 'Floor Staff'}</span>
              </div>
              <div className="info-chip">
                <Calendar size={14} />
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="receipt-special-instructions">
                <strong>Kitchen Instructions:</strong> {order.notes}
              </div>
            )}

            {/* Items Table */}
            <table className="receipt-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`}>
                    <td>
                      <div className="receipt-item-title">{item.name}</div>
                      {item.notes && (
                        <div className="receipt-item-subnote">Note: {item.notes}</div>
                      )}
                    </td>
                    <td className="text-center font-bold">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right font-bold">
                      {formatCurrency(item.subtotal || item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="receipt-financials">
              <div className="financial-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="financial-row">
                <span>Sales Tax (8%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="financial-row">
                <span>Service Charge (10%)</span>
                <span>{formatCurrency(order.serviceCharge)}</span>
              </div>
              <div className="financial-row total-row">
                <span>Total Amount Due</span>
                <span className="total-amount">{formatCurrency(order.total)}</span>
              </div>
              <div className="payment-status-badge">
                Payment Status:{' '}
                <strong style={{ textTransform: 'uppercase' }}>
                  {order.paymentStatus || 'UNPAID'}
                </strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Order Timeline & Stage Tracker */}
        <div className="order-detail-right no-print">
          <Card title="Order Progression Tracker">
            <div className="order-timeline">
              <div
                className={`timeline-step ${
                  ['pending', 'preparing', 'ready', 'completed'].includes(order.status)
                    ? 'is-done'
                    : ''
                }`}
              >
                <div className="timeline-marker">1</div>
                <div className="timeline-info">
                  <div className="timeline-title">Order Placed</div>
                  <div className="timeline-desc">
                    Ticket logged at POS floor terminal
                  </div>
                </div>
              </div>

              <div
                className={`timeline-step ${
                  ['preparing', 'ready', 'completed'].includes(order.status)
                    ? 'is-done'
                    : ''
                }`}
              >
                <div className="timeline-marker">2</div>
                <div className="timeline-info">
                  <div className="timeline-title">Kitchen Cook Line</div>
                  <div className="timeline-desc">Chefs actively preparing courses</div>
                </div>
              </div>

              <div
                className={`timeline-step ${
                  ['ready', 'completed'].includes(order.status) ? 'is-done' : ''
                }`}
              >
                <div className="timeline-marker">3</div>
                <div className="timeline-info">
                  <div className="timeline-title">Plated & Ready to Serve</div>
                  <div className="timeline-desc">Dishes on pass ready for food runner</div>
                </div>
              </div>

              <div
                className={`timeline-step ${
                  order.status === 'completed' ? 'is-done' : ''
                }`}
              >
                <div className="timeline-marker">4</div>
                <div className="timeline-info">
                  <div className="timeline-title">Served & Closed</div>
                  <div className="timeline-desc">Bill settled with customer</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
