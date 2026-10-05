import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge/Badge';
import { Button } from '../../components/common/Button/Button';
import { Modal } from '../../components/common/Modal/Modal';
import { tableService } from '../../services/tableService';
import { TABLE_ZONES, TABLE_STATUS_LABELS } from '../../utils/constants';
import { getTableStatusVariant, formatTimeAgo } from '../../utils/formatters';
import './TablesPage.css';

export function TablesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Selected table for quick action modal
  const [selectedTable, setSelectedTable] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tableService.getTables({
        zone: selectedZone,
        status: selectedStatus,
      });
      setTables(data);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [selectedZone, selectedStatus]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setIsActionModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTable) return;
    try {
      const updated = await tableService.updateTableStatus(selectedTable.id, newStatus);
      setTables((prev) => prev.map((t) => (t.id === selectedTable.id ? updated : t)));
      setSelectedTable(updated);
      setIsActionModalOpen(false);
    } catch (err) {
      alert(`Error updating table: ${err.message}`);
    }
  };

  const getStatusSummary = () => {
    const total = tables.length;
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const available = tables.filter((t) => t.status === 'available').length;
    const reserved = tables.filter((t) => t.status === 'reserved').length;
    return { total, occupied, available, reserved };
  };

  const summary = getStatusSummary();

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Table Floor Plan</h1>
          <p className="page-subtitle">Real-time floor layout, guest turnover, and table service status.</p>
        </div>
        <div className="floor-quick-legend">
          <span className="legend-chip available">● {summary.available} Available</span>
          <span className="legend-chip occupied">● {summary.occupied} Occupied</span>
          <span className="legend-chip reserved">● {summary.reserved} Reserved</span>
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="tables-filter-bar">
        <div className="zone-tabs-list">
          {TABLE_ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`zone-tab-btn ${selectedZone === zone.id ? 'is-active' : ''}`}
              onClick={() => setSelectedZone(zone.id)}
            >
              {zone.label}
            </button>
          ))}
        </div>

        <select
          className="table-status-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="available">Available Only</option>
          <option value="occupied">Occupied Only</option>
          <option value="reserved">Reserved Only</option>
          <option value="cleaning">Needs Cleaning</option>
        </select>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="dashboard-loading-state">
          <div className="btn-spinner" style={{ width: 28, height: 28 }} />
          <p>Syncing floor tables...</p>
        </div>
      ) : (
        <div className="tables-grid">
          {tables.map((table) => {
            const variant = getTableStatusVariant(table.status);
            return (
              <div
                key={table.id}
                className={`table-card table-${table.status}`}
                onClick={() => handleTableClick(table)}
              >
                <div className="table-card-top">
                  <div className="table-number-box">
                    <span className="table-prefix">TABLE</span>
                    <span className="table-num">{table.number}</span>
                  </div>
                  <Badge variant={variant} size="sm" dot>
                    {TABLE_STATUS_LABELS[table.status] || table.status}
                  </Badge>
                </div>

                <div className="table-card-body">
                  <div className="table-capacity-row">
                    <Users size={14} />
                    <span>
                      {table.status === 'occupied'
                        ? `${table.guests || 2} / ${table.capacity} guests`
                        : `${table.capacity} seats`}
                    </span>
                  </div>

                  {table.status === 'occupied' && (
                    <div className="table-seated-time">
                      <Clock size={13} />
                      <span>Seated {formatTimeAgo(table.seatedAt)}</span>
                    </div>
                  )}

                  {table.status === 'reserved' && table.reservedFor && (
                    <div className="table-reserved-info">
                      <Sparkles size={13} />
                      <span>{table.reservedFor}</span>
                    </div>
                  )}

                  {table.server && (
                    <div className="table-server-name">Server: {table.server}</div>
                  )}
                </div>

                <div className="table-card-footer">
                  {table.currentOrderId ? (
                    <button
                      type="button"
                      className="table-order-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${table.currentOrderId}`);
                      }}
                    >
                      <ShoppingBag size={13} />
                      <span>Order {table.currentOrderId}</span>
                    </button>
                  ) : (
                    <span className="table-idle-text">Click to manage</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Quick Action Modal */}
      {selectedTable && (
        <Modal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          title={`Manage Table ${selectedTable.number} (${selectedTable.zone?.toUpperCase()})`}
          size="sm"
          footer={
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="table-modal-details">
            <div className="table-modal-meta">
              <div>
                <strong>Capacity:</strong> {selectedTable.capacity} guests
              </div>
              <div>
                <strong>Current Status:</strong>{' '}
                <Badge variant={getTableStatusVariant(selectedTable.status)} size="sm">
                  {TABLE_STATUS_LABELS[selectedTable.status]}
                </Badge>
              </div>
              {selectedTable.server && (
                <div>
                  <strong>Assigned Server:</strong> {selectedTable.server}
                </div>
              )}
            </div>

            <div className="table-modal-actions-title">Update Table Status</div>
            <div className="table-status-actions-grid">
              <Button
                variant={selectedTable.status === 'available' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleUpdateStatus('available')}
              >
                Mark Available (Free)
              </Button>
              <Button
                variant={selectedTable.status === 'occupied' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleUpdateStatus('occupied')}
              >
                Seat Guests (Occupied)
              </Button>
              <Button
                variant={selectedTable.status === 'reserved' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleUpdateStatus('reserved')}
              >
                Mark Reserved
              </Button>
              <Button
                variant={selectedTable.status === 'cleaning' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleUpdateStatus('cleaning')}
              >
                Needs Bussing / Clean
              </Button>
            </div>

            {selectedTable.currentOrderId && (
              <div className="table-modal-order-action">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  leftIcon={<ShoppingBag size={16} />}
                  onClick={() => {
                    setIsActionModalOpen(false);
                    navigate(`/orders/${selectedTable.currentOrderId}`);
                  }}
                >
                  Open Order Ticket ({selectedTable.currentOrderId})
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
