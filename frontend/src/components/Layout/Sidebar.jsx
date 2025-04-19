import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/Sidebar.css';

const Sidebar = ({ menuOpen, toggleMenu, logoUrl }) => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <div className="sidebar-container">
      <button className="mobile-menu-button" onClick={toggleMenu}>
        {menuOpen ? '✕' : '☰'}
      </button>
      
      <div 
        className={`sidebar-overlay ${menuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
      ></div>
      
      <div className={`sidebar ${menuOpen ? 'active' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/">
            <img src="../../public/logo_q.png" alt="" />
            QUICKET
          </Link>
        </div>
        
        <ul className="sidebar-links">
          <li>
            <Link to="/">
              <span role="img" aria-label="home" className="icon">🏠</span>
              {t('navigation.home')}
              <span className="arrow">→</span>
            </Link>
          </li>
          <li>
            <Link to="/events">
              <span role="img" aria-label="events" className="icon">🎭</span>
              {t('navigation.events')}
              <span className="arrow">→</span>
            </Link>
          </li>
          <li>
            <Link to="/notifications">
              <span role="img" aria-label="notifications" className="icon">🔔</span>
              {t('navigation.notifications')}
              <span className="arrow">→</span>
            </Link>
          </li>
          
          {user && (
            <li>
              <Link to="/bookings">
                <span role="img" aria-label="bookings" className="icon">🎟️</span>
                {t('navigation.bookings')}
                <span className="arrow">→</span>
              </Link>
            </li>
          )}
          
          {!user ? (
            <>
              <li>
                <Link to="/login">
                  <span role="img" aria-label="login" className="icon">🔑</span>
                  {t('navigation.login')}
                  <span className="arrow">→</span>
                </Link>
              </li>
              <li>
                <Link to="/register">
                  <span role="img" aria-label="register" className="icon">📝</span>
                  {t('navigation.register')}
                  <span className="arrow">→</span>
                </Link>
              </li>
            </>
          ) : (
            <li>
              <button onClick={logout} className="sidebar-link-button">
                <span role="img" aria-label="logout" className="icon">🚪</span>
                {t('navigation.logout')}
                <span className="arrow">→</span>
              </button>
            </li>
          )}
        </ul>
        
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-name">{user.name || 'user'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;