import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Filter, Calendar, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '../../components/common/Input/Input';
import { Badge } from '../../components/common/Badge/Badge';
import { Button } from '../../components/common/Button/Button';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './OrderHistoryPage.css';

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderHistory({
        search: searchQuery,
        status: statusFilter,
        paymentMethod: paymentFilter,
      });
      setHistory(data);
    } catch (err) {
      console.error('Failed to load order history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [searchQuery, statusFilter, paymentFilter]);

  // Aggregate stats
  const completedOrders = history.filter((o) => o.status === 'completed');
  const totalSettledRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgCheck = completedOrders.length > 0 ? totalSettledRevenue / completedOrders.length : 0;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order History & Archives</h1>
          <p className="page-subtitle">Historical completed checks, payment settlements, and audit logs.</p>
        </div>
      </div>

      {/* Aggregate Metric Highlights */}
      <div className="history-kpis-grid">
        <div className="history-kpi-item">
          <span className="kpi-label">Settled Shift Revenue</span>
          <span className="kpi-number">{formatCurrency(totalSettledRevenue)}</span>
        </div>
        <div className="history-kpi-item">
          <span className="kpi-label">Completed Checks</span>
          <span className="kpi-number">{completedOrders.length}</span>
        </div>
        <div className="history-kpi-item">
          <span className="kpi-label">Average Check Size</span>
          <span className="kpi-number">{formatCurrency(avgCheck)}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="history-filter-bar">
        <div className="history-search">
          <Input
            placeholder="Search order number or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <div className="history-dropdown-filters">
          <select
            className="history-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Outcomes</option>
            <option value="completed">Completed & Paid</option>
            <option value="cancelled">Cancelled / Void</option>
          </select>

          <select
            className="history-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payment Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cash">Cash</option>
            <option value="Digital Pay / QR">Digital Pay / QR</option>
          </select>
        </div>
      </div>

      {/* Historical Orders Table */}
      {loading ? (
        <div className="dashboard-loading-state">
          <div className="btn-spinner" style={{ width: 28, height: 28 }} />
          <p>Retrieving archives...</p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Completed Time</th>
                <th>Order #</th>
                <th>Table</th>
                <th>Guests</th>
                <th>Server</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th className="text-right">Total</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="clickable-history-row"
                >
                  <td className="history-date">
                    {formatDateTime(order.completedAt)}
                  </td>
                  <td className="font-bold">{order.orderNumber}</td>
                  <td>Table {order.tableNumber}</td>
                  <td>{order.guestCount} guests</td>
                  <td>{order.server || 'Floor Server'}</td>
                  <td>
                    <span className="payment-method-pill">
                      <CreditCard size={13} />
                      {order.paymentMethod || 'Credit Card'}
                    </span>
                  </td>
                  <td>
                    <Badge
                      variant={order.status === 'completed' ? 'success' : 'danger'}
                      size="sm"
                      dot
                    >
                      {order.status === 'completed' ? 'Settled' : 'Cancelled'}
                    </Badge>
                  </td>
                  <td className="text-right font-bold text-lg">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="text-center">
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
    </div>
  );
}
