import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators';
import { Users, Store, Star, Plus, Search, Filter, AlertCircle, CheckCircle2, Shield, UserCheck, StoreIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0, overallAverageRating: '0.00' });
  
  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('ASC');

  // Stores state
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('ASC');

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, userSearch, userRoleFilter, userSortBy, userSortOrder, storeSearch, storeSortBy, storeSortOrder]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          search: userSearch,
          role: userRoleFilter,
          sortBy: userSortBy,
          sortOrder: userSortOrder
        }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const res = await api.get('/admin/stores', {
        params: {
          search: storeSearch,
          sortBy: storeSortBy,
          sortOrder: storeSortOrder
        }
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setStoresLoading(false);
    }
  };

  const handleUserSort = (colKey) => {
    if (userSortBy === colKey) {
      setUserSortOrder(userSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUserSortBy(colKey);
      setUserSortOrder('ASC');
    }
  };

  const handleStoreSort = (colKey) => {
    if (storeSortBy === colKey) {
      setStoreSortOrder(storeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoreSortBy(colKey);
      setStoreSortOrder('ASC');
    }
  };

  // Add User Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const nErr = validateName(newUser.name); if (nErr) errors.name = nErr;
    const eErr = validateEmail(newUser.email); if (eErr) errors.email = eErr;
    const aErr = validateAddress(newUser.address); if (aErr) errors.address = aErr;
    const pErr = validatePassword(newUser.password); if (pErr) errors.password = pErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const res = await api.post('/admin/users', newUser);
      if (res.data.success) {
        setFeedback({ type: 'success', message: res.data.message });
        setIsAddUserOpen(false);
        setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
        setFormErrors({});
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to add user.' });
    }
  };

  // Add Store Submit
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    if (!newStore.name || newStore.name.length < 2) {
      setFormErrors({ name: 'Store Name is required (at least 2 characters).' });
      return;
    }
    const eErr = validateEmail(newStore.email);
    if (eErr) {
      setFormErrors({ email: eErr });
      return;
    }
    const aErr = validateAddress(newStore.address);
    if (aErr) {
      setFormErrors({ address: aErr });
      return;
    }

    try {
      const res = await api.post('/admin/stores', {
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        ownerId: newStore.ownerId || null
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Store created successfully.' });
        setIsAddStoreOpen(false);
        setNewStore({ name: '', email: '', address: '', ownerId: '' });
        setFormErrors({});
        fetchStores();
        fetchStats();
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to add store.' });
    }
  };

  // User columns definition
  const userColumns = [
    { title: 'User Name', key: 'name', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Address', key: 'address', sortable: true },
    { 
      title: 'Role', 
      key: 'role', 
      sortable: true,
      render: (val) => {
        if (val === 'SYSTEM_ADMIN') return <span className="role-badge admin">Admin</span>;
        if (val === 'STORE_OWNER') return <span className="role-badge owner">Store Owner</span>;
        return <span className="role-badge user">Normal User</span>;
      }
    },
    {
      title: "Store Owner's Store & Rating",
      key: 'store',
      sortable: false,
      render: (val, row) => {
        if (row.role === 'STORE_OWNER') {
          if (row.store) {
            return (
              <div>
                <strong style={{ color: '#ffffff' }}>{row.store.name}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <StarRating rating={parseFloat(row.store.averageRating)} size={14} />
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                    {row.store.averageRating} ({row.store.totalRatings} ratings)
                  </span>
                </div>
              </div>
            );
          }
          return <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No Store Assigned</span>;
        }
        return <span style={{ color: '#64748b', fontSize: '0.85rem' }}>N/A</span>;
      }
    },
    {
      title: 'Action',
      key: 'id',
      sortable: false,
      render: (_, row) => (
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedUserDetail(row)}
        >
          View Details
        </button>
      )
    }
  ];

  // Store columns definition
  const storeColumns = [
    { title: 'Store Name', key: 'name', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Address', key: 'address', sortable: true },
    {
      title: 'Owner',
      key: 'owner',
      sortable: false,
      render: (owner) => owner ? (
        <div>
          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{owner.name}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{owner.email}</div>
        </div>
      ) : <span style={{ color: '#64748b' }}>Unassigned</span>
    },
    {
      title: 'Overall Rating',
      key: 'overallRating',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarRating rating={val} size={16} />
          <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
            {val} ({row.totalRatings})
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="gradient-text">System Administrator Dashboard</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Overview of all registered users, stores, and ratings system metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => { setFormErrors({}); setIsAddUserOpen(true); }}>
            <Plus size={18} />
            Add User
          </button>
          <button className="btn btn-primary" onClick={() => { setFormErrors({}); setIsAddStoreOpen(true); }}>
            <Plus size={18} />
            Add Store
          </button>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <StatCard title="Total Registered Users" value={stats.totalUsers} icon={Users} accentColor="#6366f1" />
        <StatCard title="Total Active Stores" value={stats.totalStores} icon={Store} accentColor="#a855f7" />
        <StatCard title="Total Submitted Ratings" value={stats.totalRatings} icon={Star} accentColor="#f59e0b" />
        <StatCard title="System Avg Rating" value={stats.overallAverageRating} icon={Star} accentColor="#10b981" />
      </div>

      {/* Navigation Tabs */}
      <div className="tab-group">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Management ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          Stores Directory ({stores.length})
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div>
          <div className="table-toolbar">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="form-control"
                placeholder="Search users by Name, Email, or Address..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: '#94a3b8' }} />
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: 160 }}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
                <option value="NORMAL_USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={userColumns}
            data={users}
            sortBy={userSortBy}
            sortOrder={userSortOrder}
            onSort={handleUserSort}
            loading={usersLoading}
            emptyMessage="No users found matching query."
          />
        </div>
      )}

      {/* TAB 2: STORES DIRECTORY */}
      {activeTab === 'stores' && (
        <div>
          <div className="table-toolbar">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="form-control"
                placeholder="Search stores by Name, Email, or Address..."
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
              />
            </div>
          </div>

          <DataTable
            columns={storeColumns}
            data={stores}
            sortBy={storeSortBy}
            sortOrder={storeSortOrder}
            onSort={handleStoreSort}
            loading={storesLoading}
            emptyMessage="No stores found matching query."
          />
        </div>
      )}

      {/* MODAL: ADD USER */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Add New System / Normal User">
        <form onSubmit={handleAddUserSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name (20–60 characters)</label>
            <input
              type="text"
              className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Johnathan Edward Resident User"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            {formErrors.name && <span className="invalid-feedback">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. newuser@storerating.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            {formErrors.email && <span className="invalid-feedback">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address (Max 400 characters)</label>
            <input
              type="text"
              className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
              placeholder="e.g. 100 Main Boulevard, Austin, TX"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            />
            {formErrors.address && <span className="invalid-feedback">{formErrors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password (8–16 chars, 1 uppercase, 1 special char)</label>
            <input
              type="password"
              className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
              placeholder="e.g. User@12345"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            {formErrors.password && <span className="invalid-feedback">{formErrors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">User Role</label>
            <select
              className="form-control"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="SYSTEM_ADMIN">System Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
            Create Account
          </button>
        </form>
      </Modal>

      {/* MODAL: ADD STORE */}
      <Modal isOpen={isAddStoreOpen} onClose={() => setIsAddStoreOpen(false)} title="Add New Store">
        <form onSubmit={handleAddStoreSubmit}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Apex Fitness Gear Store"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            />
            {formErrors.name && <span className="invalid-feedback">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. contact@store.com"
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
            />
            {formErrors.email && <span className="invalid-feedback">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address (Max 400 characters)</label>
            <input
              type="text"
              className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
              placeholder="e.g. 654 Athletic Drive, Denver, CO"
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            />
            {formErrors.address && <span className="invalid-feedback">{formErrors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Assign Store Owner (Optional)</label>
            <select
              className="form-control"
              value={newStore.ownerId}
              onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
            >
              <option value="">-- No Owner Assigned --</option>
              {users
                .filter(u => u.role === 'STORE_OWNER')
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
            Create Store
          </button>
        </form>
      </Modal>

      {/* MODAL: VIEW COMPLETE USER DETAILS */}
      <Modal isOpen={!!selectedUserDetail} onClose={() => setSelectedUserDetail(null)} title="Complete User Profile Details">
        {selectedUserDetail && (
          <div>
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{selectedUserDetail.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>Email:</strong> {selectedUserDetail.email}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>Address:</strong> {selectedUserDetail.address}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>Role:</strong> {selectedUserDetail.role}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                <strong>Member Since:</strong> {new Date(selectedUserDetail.createdAt).toLocaleDateString()}
              </p>
            </div>

            {selectedUserDetail.role === 'STORE_OWNER' && (
              <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'var(--border-highlight)' }}>
                <h4 style={{ color: '#fbbf24', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StoreIcon size={18} /> Assigned Store Analytics
                </h4>
                {selectedUserDetail.store ? (
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedUserDetail.store.name}</div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating rating={parseFloat(selectedUserDetail.store.averageRating)} size={18} />
                      <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem' }}>
                        {selectedUserDetail.store.averageRating} / 5.0
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        ({selectedUserDetail.store.totalRatings} total ratings)
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8' }}>This Store Owner has not been assigned a store yet.</p>
                )}
              </div>
            )}

            <button className="btn btn-secondary btn-full" style={{ marginTop: '1.25rem' }} onClick={() => setSelectedUserDetail(null)}>
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
