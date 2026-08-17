import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StarRating from '../components/StarRating';
import DataTable from '../components/DataTable';
import { Store, Star, Users, Search, MapPin, Mail, AlertCircle, Building2 } from 'lucide-react';

const OwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  
  // Search & Sort
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    fetchOwnerDashboard();
  }, []);

  useEffect(() => {
    if (hasStore) {
      fetchRatings();
    }
  }, [hasStore, search, sortBy, sortOrder]);

  const fetchOwnerDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/dashboard');
      if (res.data.success) {
        setHasStore(res.data.hasStore);
        setStore(res.data.store || null);
      }
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    setRatingsLoading(true);
    try {
      const res = await api.get('/owner/ratings', {
        params: {
          search,
          sortBy,
          sortOrder
        }
      });
      if (res.data.success) {
        setRatings(res.data.ratings);
      }
    } catch (err) {
      console.error('Failed to fetch store ratings list:', err);
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleSort = (colKey) => {
    if (sortBy === colKey) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(colKey);
      setSortOrder('ASC');
    }
  };

  const columns = [
    {
      title: 'Customer Name',
      key: 'user_name',
      sortable: true,
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{row.user.name}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: #{row.user.id}</div>
        </div>
      )
    },
    {
      title: 'Email Address',
      key: 'user_email',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
          <Mail size={14} style={{ color: '#818cf8' }} />
          <span>{row.user.email}</span>
        </div>
      )
    },
    {
      title: 'User Address',
      key: 'user_address',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: '#cbd5e1', maxWidth: 300 }}>
          <MapPin size={14} style={{ minWidth: 14, color: '#818cf8', marginTop: 3 }} />
          <span>{row.user.address}</span>
        </div>
      )
    },
    {
      title: 'Rating Submitted',
      key: 'rating',
      sortable: true,
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarRating rating={val} size={16} />
          <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.95rem' }}>
            {val} / 5
          </span>
        </div>
      )
    },
    {
      title: 'Date Submitted / Modified',
      key: 'updated_at',
      sortable: true,
      render: (val) => (
        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          {new Date(val).toLocaleString()}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Store Owner Portal...</span>
      </div>
    );
  }

  if (!hasStore) {
    return (
      <div className="app-container">
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: 600, margin: '2rem auto' }}>
          <Building2 size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
          <h2>No Store Assigned</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
            Your account is registered as a Store Owner, but no store has been assigned to you yet. Please contact the System Administrator to map your store.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Store Header Banner */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="navbar-brand-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Store size={22} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem' }}>{store.name}</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 2 }}>{store.address}</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem 1.5rem', borderRadius: 12, border: '1px solid var(--border-color)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Store Average Rating</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <StarRating rating={parseFloat(store.averageRating)} size={22} />
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>
                {store.averageRating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <StatCard title="Overall Rating Score" value={`${store.averageRating} / 5.0`} icon={Star} accentColor="#f59e0b" />
        <StatCard title="Total Ratings Received" value={store.totalRatings} icon={Users} accentColor="#6366f1" />
        <StatCard title="5-Star Ratings" value={store.distribution[5] || 0} icon={Star} accentColor="#10b981" />
        <StatCard title="1-Star Ratings" value={store.distribution[1] || 0} icon={AlertCircle} accentColor="#ef4444" />
      </div>

      {/* Rating Submitters Section */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>User Rating Submissions</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Detailed list of customers who have submitted feedback for {store.name}.</p>
      </div>

      <div className="table-toolbar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search users by Name, Email, or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={ratings}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={ratingsLoading}
        emptyMessage="No rating submissions found for your store."
      />
    </div>
  );
};

export default OwnerDashboard;
