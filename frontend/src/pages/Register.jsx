import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators';
import { User, Mail, Lock, MapPin, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const addrErr = validateAddress(formData.address);
    if (addrErr) newErrors.address = addrErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData);
      navigate('/user/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card" style={{ maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2>Create Normal User Account</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 4 }}>
            Register to submit reviews,rate stores, and discover local businesses.
          </p>
        </div>

        {serverError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field (20 - 60 chars) */}
          <div className="form-group">
            <label className="form-label">Full Name (20–60 characters)</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <User className="search-icon" size={18} />
              <input
                type="text"
                name="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Johnathan Edward Resident User"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && <span className="invalid-feedback">{errors.name}</span>}
            <div className="char-counter">{formData.name.trim().length} / 60 characters</div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <Mail className="search-icon" size={18} />
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="e.g. user@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="invalid-feedback">{errors.email}</span>}
          </div>

          {/* Address Field (max 400 chars) */}
          <div className="form-group">
            <label className="form-label">Address (Max 400 characters)</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <MapPin className="search-icon" size={18} />
              <input
                type="text"
                name="address"
                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                placeholder="e.g. 123 Maple Street, Apartment 4B, Boston, MA"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            {errors.address && <span className="invalid-feedback">{errors.address}</span>}
            <div className="char-counter">{formData.address.trim().length} / 400 characters</div>
          </div>

          {/* Password Field (8-16, uppercase, special char) */}
          <div className="form-group">
            <label className="form-label">Password (8–16 chars, 1 uppercase, 1 special char)</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <Lock className="search-icon" size={18} />
              <input
                type="password"
                name="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="e.g. User@12345"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && <span className="invalid-feedback">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} />
                Complete Registration
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
