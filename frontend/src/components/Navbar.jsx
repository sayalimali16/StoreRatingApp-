import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, KeyRound, Shield, UserCheck, StoreIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <span className="role-badge admin"><Shield size={12} style={{ display: 'inline', marginRight: 4 }} /> Admin</span>;
      case 'STORE_OWNER':
        return <span className="role-badge owner"><StoreIcon size={12} style={{ display: 'inline', marginRight: 4 }} /> Store Owner</span>;
      case 'NORMAL_USER':
        return <span className="role-badge user"><UserCheck size={12} style={{ display: 'inline', marginRight: 4 }} /> User</span>;
      default:
        return null;
    }
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SYSTEM_ADMIN':
        return '/admin/dashboard';
      case 'STORE_OWNER':
        return '/owner/dashboard';
      case 'NORMAL_USER':
      default:
        return '/user/dashboard';
    }
  };

  return (
    <header className="navbar">
      <Link to={getDashboardRoute()} className="navbar-brand">
        <div className="navbar-brand-icon">
          <Store size={22} color="white" />
        </div>
        <span>Store Rating <span className="gradient-text">Hub</span></span>
      </Link>

      <nav>
        <ul className="nav-links">
          {user ? (
            <>
              <li>
                <Link 
                  to={getDashboardRoute()} 
                  className={`nav-link ${location.pathname.includes('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/change-password" 
                  className={`nav-link ${location.pathname === '/change-password' ? 'active' : ''}`}
                >
                  <KeyRound size={16} />
                  Change Password
                </Link>
              </li>
              <li>
                <div className="user-pill">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                  {getRoleBadge(user.role)}
                </div>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  <LogOut size={16} />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
