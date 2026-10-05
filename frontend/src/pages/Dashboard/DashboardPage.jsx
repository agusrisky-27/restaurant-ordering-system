import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Grid,
  Users,
  ArrowUpRight,
  Clock,
  ChevronRight,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Card } from '../../components/common/Card/Card';
import { Badge } from '../../components/common/Badge/Badge';
import { Button } from '../../components/common/Button/Button';
import { dashboardService } from '../../services/dashboardService';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatTimeAgo, getOrderStatusVariant } from '../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import './DashboardPage.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsData, ordersData] = await Promise.all([
          dashboardService.getDashboardStats(),
          orderService.getActiveOrders(),
        ]);
        setStats(statsData);
        setActiveOrders(ordersData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading-state">
          <div className="btn-spinner" style={{ width: 32, height: 32 }} />
          <p>Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time floor occupancy, kitchen speed, and daily shift revenue.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/tables')}
          >
            Floor Plan
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/orders')}
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Today's Revenue */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Today's Revenue</span>
            <div className="kpi-icon revenue-icon">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(stats?.todayRevenue || 0)}</div>
          <div className="kpi-trend positive">
            <TrendingUp size={14} />
            <span>{stats?.revenueGrowth}</span>
          </div>
        </div>

        {/* Active Orders */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Active Orders</span>
            <div className="kpi-icon orders-icon">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeOrders.length}</div>
          <div className="kpi-pills">
            <span className="status-subpill pending">{stats?.pendingOrdersCount} incoming</span>
            <span className="status-subpill preparing">{stats?.preparingOrdersCount} cooking</span>
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Table Occupancy</span>
            <div className="kpi-icon tables-icon">
              <Grid size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.tableOccupancyRate}%</div>
          <div className="occupancy-progress-bar">
            <div
              className="occupancy-fill"
              style={{ width: `${stats?.tableOccupancyRate}%` }}
            />
          </div>
          <div className="kpi-hint">
            {stats?.occupiedTablesCount} of {stats?.totalTablesCount} tables active
          </div>
        </div>

        {/* Guests Served */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Guests Served Today</span>
            <div className="kpi-icon guests-icon">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.totalGuestsToday}</div>
          <div className="kpi-hint">Across all dining zones</div>
        </div>
      </div>

      {/* Two-Column Layout: Live Orders & Top Dishes */}
      <div className="dashboard-content-split">
        {/* Left: Active Orders Queue */}
        <div className="dashboard-left-col">
          <Card
            title="Live Orders in Progress"
            subtitle={`${activeOrders.length} tickets actively being prepared`}
            action={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowUpRight size={14} />}
                onClick={() => navigate('/orders')}
              >
                View Kanban
              </Button>
            }
          >
            <div className="dashboard-orders-list">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="dashboard-order-item"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="order-item-left">
                    <div className="order-table-chip">Table {order.tableNumber}</div>
                    <div className="order-details">
                      <div className="order-num-row">
                        <span className="order-num">{order.orderNumber}</span>
                        <span className="order-type-tag">• {order.type}</span>
                      </div>
                      <div className="order-items-snippet">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="order-item-right">
                    <div className="order-time-row">
                      <Clock size={12} />
                      <span>{formatTimeAgo(order.createdAt)}</span>
                    </div>
                    <Badge variant={getOrderStatusVariant(order.status)} dot>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                    <span className="order-price">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Popular Items */}
        <div className="dashboard-right-col">
          <Card
            title="Top Selling Dishes Today"
            subtitle="Based on completed guest checks"
            action={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ChevronRight size={14} />}
                onClick={() => navigate('/menu')}
              >
                Menu
              </Button>
            }
          >
            <div className="popular-dishes-list">
              {stats?.popularDishes?.map((dish, idx) => (
                <div key={dish.name} className="popular-dish-row">
                  <div className="dish-rank">#{idx + 1}</div>
                  <div className="dish-info">
                    <div className="dish-name">{dish.name}</div>
                    <div className="dish-meta">{dish.ordersCount} orders served</div>
                  </div>
                  <div className="dish-revenue">{formatCurrency(dish.revenue)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
