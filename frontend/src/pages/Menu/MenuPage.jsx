import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Badge } from '../../components/common/Badge/Badge';
import { Modal } from '../../components/common/Modal/Modal';
import { menuService } from '../../services/menuService';
import { MENU_CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import './MenuPage.css';

export function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    name: '',
    category: 'mains',
    price: '',
    prepTime: '15 min',
    description: '',
    isAvailable: true,
    isSpecial: false,
    tags: '',
  });

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const data = await menuService.getItems({
        category: activeCategory,
        search: searchQuery,
        status: stockFilter,
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, [activeCategory, searchQuery, stockFilter]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalFormData({
      name: '',
      category: 'mains',
      price: '',
      prepTime: '15 min',
      description: '',
      isAvailable: true,
      isSpecial: false,
      tags: 'Chef Special, Gluten-Free',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setModalFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      prepTime: item.prepTime,
      description: item.description,
      isAvailable: item.isAvailable,
      isSpecial: item.isSpecial,
      tags: item.tags ? item.tags.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const handleToggleStock = async (id, e) => {
    e.stopPropagation();
    try {
      const updated = await menuService.toggleAvailability(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      console.error('Failed to toggle stock:', err);
    }
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this item from the active menu?')) {
      try {
        await menuService.deleteItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    const payload = {
      name: modalFormData.name,
      category: modalFormData.category,
      price: parseFloat(modalFormData.price) || 0,
      prepTime: modalFormData.prepTime,
      description: modalFormData.description,
      isAvailable: modalFormData.isAvailable,
      isSpecial: modalFormData.isSpecial,
      tags: modalFormData.tags
        ? modalFormData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editingItem) {
        const updated = await menuService.updateItem(editingItem.id, payload);
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
      } else {
        const created = await menuService.createItem(payload);
        setItems((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(`Error saving item: ${err.message}`);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Configure recipes, floor availability, pricing, and chef specials.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={handleOpenAddModal}
        >
          Add Menu Item
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="menu-filter-toolbar">
        <div className="menu-search-box">
          <Input
            placeholder="Search dish or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <div className="menu-stock-filter">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="menu-select-filter"
          >
            <option value="all">All Availability</option>
            <option value="in_stock">Available Only</option>
            <option value="out_of_stock">Sold Out Only</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills-row">
        {MENU_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-pill ${activeCategory === cat.id ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      {loading ? (
        <div className="dashboard-loading-state">
          <div className="btn-spinner" style={{ width: 28, height: 28 }} />
          <p>Loading menu inventory...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state-card">
          <AlertCircle size={40} className="empty-icon" />
          <h3>No Menu Items Found</h3>
          <p>Try changing your category filter or search keywords.</p>
          <Button variant="outline" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="menu-cards-grid">
          {items.map((item) => (
            <div
              key={item.id}
              className={`menu-dish-card ${!item.isAvailable ? 'is-sold-out' : ''}`}
            >
              <div className="dish-card-header">
                <div className="dish-top-badges">
                  <Badge variant="neutral" size="sm">
                    {item.category}
                  </Badge>
                  {item.isSpecial && (
                    <Badge variant="purple" size="sm" icon={<Sparkles size={12} />}>
                      Chef Special
                    </Badge>
                  )}
                </div>
                <div className="dish-actions">
                  <button
                    type="button"
                    className="dish-action-btn edit"
                    onClick={() => handleOpenEditModal(item)}
                    title="Edit Item"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="dish-action-btn delete"
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    title="Remove Item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="dish-main-info">
                <div className="dish-title-row">
                  <h3 className="dish-title">{item.name}</h3>
                  <span className="dish-price">{formatCurrency(item.price)}</span>
                </div>
                <p className="dish-desc">{item.description}</p>
              </div>

              {/* Tags & Prep time */}
              <div className="dish-meta-row">
                <div className="dish-prep-time">
                  <Clock size={13} />
                  <span>{item.prepTime || '12 min'}</span>
                </div>
                <div className="dish-tags">
                  {item.tags?.map((tag) => (
                    <span key={tag} className="dish-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Availability Toggle */}
              <div className="dish-card-footer">
                <span
                  className={`stock-indicator ${
                    item.isAvailable ? 'in-stock' : 'out-of-stock'
                  }`}
                >
                  {item.isAvailable ? '● Available in Kitchen' : '○ Sold Out'}
                </span>
                <button
                  type="button"
                  className={`availability-toggle-btn ${
                    item.isAvailable ? 'btn-active' : ''
                  }`}
                  onClick={(e) => handleToggleStock(item.id, e)}
                >
                  {item.isAvailable ? 'Set Sold Out' : 'Mark Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Dish Details' : 'Add New Menu Dish'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveModal}>
              {editingItem ? 'Save Changes' : 'Create Dish'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveModal} className="menu-modal-form">
          <Input
            label="Dish Name"
            value={modalFormData.name}
            onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
            placeholder="e.g. Truffle Pappardelle"
            required
          />

          <div className="form-two-cols">
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="input-control"
                value={modalFormData.category}
                onChange={(e) =>
                  setModalFormData({ ...modalFormData, category: e.target.value })
                }
              >
                <option value="starters">Starters</option>
                <option value="mains">Main Courses</option>
                <option value="desserts">Desserts</option>
                <option value="beverages">Beverages</option>
                <option value="specials">Chef Specials</option>
              </select>
            </div>

            <Input
              label="Price (USD)"
              type="number"
              step="0.5"
              value={modalFormData.price}
              onChange={(e) =>
                setModalFormData({ ...modalFormData, price: e.target.value })
              }
              placeholder="e.g. 24.50"
              required
            />
          </div>

          <div className="form-two-cols">
            <Input
              label="Estimated Prep Time"
              value={modalFormData.prepTime}
              onChange={(e) =>
                setModalFormData({ ...modalFormData, prepTime: e.target.value })
              }
              placeholder="e.g. 15 min"
            />
            <Input
              label="Tags (comma-separated)"
              value={modalFormData.tags}
              onChange={(e) =>
                setModalFormData({ ...modalFormData, tags: e.target.value })
              }
              placeholder="e.g. Gluten-Free, Vegan"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description & Ingredients</label>
            <textarea
              className="input-control input-textarea"
              rows={3}
              value={modalFormData.description}
              onChange={(e) =>
                setModalFormData({ ...modalFormData, description: e.target.value })
              }
              placeholder="Describe culinary preparation, origins, and key flavors..."
            />
          </div>

          <div className="form-checkbox-row">
            <label className="remember-me-checkbox">
              <input
                type="checkbox"
                checked={modalFormData.isSpecial}
                onChange={(e) =>
                  setModalFormData({ ...modalFormData, isSpecial: e.target.checked })
                }
              />
              <span className="checkbox-custom" />
              <span className="checkbox-label">Feature as Chef's Special</span>
            </label>

            <label className="remember-me-checkbox">
              <input
                type="checkbox"
                checked={modalFormData.isAvailable}
                onChange={(e) =>
                  setModalFormData({ ...modalFormData, isAvailable: e.target.checked })
                }
              />
              <span className="checkbox-custom" />
              <span className="checkbox-label">Available for Ordering</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
