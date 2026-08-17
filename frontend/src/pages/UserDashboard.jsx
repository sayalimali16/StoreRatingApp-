import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { Search, MapPin, Star, AlertCircle, CheckCircle2, SlidersHorizontal } from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Rating Modal
  const [selectedStore, setSelectedStore] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchStores();
  }, [nameSearch, addressSearch, sortBy, sortOrder]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores', {
        params: {
          name: nameSearch,
          address: addressSearch,
          sortBy,
          sortOrder
        }
      });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setCurrentRating(store.userRating || 0);
  };

  const handleRateSubmit = async (selectedRating) => {
    if (!selectedStore || !selectedRating) return;

    setSubmitting(true);
    try {
      const res = await api.post('/ratings', {
        storeId: selectedStore.id,
        rating: selectedRating
      });

      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message
        });

        // Update local state
        setStores(stores.map(s => {
          if (s.id === selectedStore.id) {
            return {
              ...s,
              overallRating: res.data.data.overallRating,
              totalRatings: res.data.data.totalRatings,
              userRating: res.data.data.userRating
            };
          }
          return s;
        }));

        setSelectedStore(null);
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to submit rating.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="gradient-text">Explore Stores & Submit Ratings</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Discover top rated stores in your area, submit new ratings, or modify your existing feedback anytime.
        </p>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search & Sort Filters */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: 2, minWidth: 220 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="form-control"
              placeholder="Search stores by Name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>

          <div className="search-input-wrapper" style={{ flex: 2, minWidth: 220 }}>
            <MapPin className="search-icon" size={18} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Address or City..."
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 180 }}>
            <SlidersHorizontal size={18} style={{ color: '#94a3b8' }} />
            <select
              className="form-control"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="name-ASC">Name (A-Z)</option>
              <option value="name-DESC">Name (Z-A)</option>
              <option value="rating-DESC">Highest Rated</option>
              <option value="rating-ASC">Lowest Rated</option>
              <option value="address-ASC">Address (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading stores...</span>
        </div>
      ) : stores.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          <h3>No Stores Found</h3>
          <p style={{ marginTop: '0.5rem' }}>No stores matched your search criteria. Try modifying your filter.</p>
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <div key={store.id} className="glass-card store-card">
              <div>
                <div className="store-card-header">
                  <h3 className="store-card-title">{store.name}</h3>
                  <div className="store-card-address">
                    <MapPin size={16} style={{ minWidth: 16, color: '#818cf8', marginTop: 2 }} />
                    <span>{store.address}</span>
                  </div>
                </div>

                {/* Overall Rating Section */}
                <div className="rating-badge-container">
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', display: 'block' }}>
                      Overall Rating
                    </span>
                    <StarRating rating={store.overallRating} size={16} showValue={true} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {store.totalRatings} rating{store.totalRatings === 1 ? '' : 's'}
                  </div>
                </div>

                {/* User's Previously Submitted Rating */}
                <div style={{ padding: '0.5rem 0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>My Submitted Rating: </span>
                  {store.userRating ? (
                    <span style={{ color: '#f59e0b', fontWeight: 700, marginLeft: 4 }}>
                      {store.userRating} / 5 Stars ⭐
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontStyle: 'italic', marginLeft: 4 }}>Not rated yet</span>
                  )}
                </div>
              </div>

              <button
                className={`btn ${store.userRating ? 'btn-secondary' : 'btn-primary'} btn-full`}
                onClick={() => openRatingModal(store)}
                style={{ marginTop: '1rem' }}
              >
                <Star size={16} />
                {store.userRating ? 'Modify My Rating' : 'Rate This Store'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* RATING MODAL */}
      <Modal
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        title={selectedStore ? `Rate "${selectedStore.name}"` : 'Submit Rating'}
      >
        {selectedStore && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Select a rating score from 1 (Poor) to 5 (Excellent):
            </p>

            <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }}>
              <StarRating
                rating={currentRating}
                interactive={true}
                onRate={(val) => {
                  setCurrentRating(val);
                  handleRateSubmit(val);
                }}
                size={36}
                showValue={true}
              />
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {submitting ? 'Saving your rating...' : 'Click on any star to save your rating instantly.'}
            </p>

            <button
              className="btn btn-secondary btn-full"
              onClick={() => setSelectedStore(null)}
              style={{ marginTop: '1.5rem' }}
            >
              Cancel
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserDashboard;
