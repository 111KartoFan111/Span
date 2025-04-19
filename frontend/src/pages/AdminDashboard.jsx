import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import apiService from '../services/api';
import AdminEventsList from '../components/Admin/AdminEventsList';
import AdminVenuesList from '../components/Admin/AdminVenuesList';
import AdminUsersList from '../components/Admin/AdminUsersList';
import AdminStats from '../components/Admin/AdminStats';
import AdminBookings from '../components/Admin/AdminBookings';
import AdminNotifications from '../components/Admin/AdminNotifications';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Загружаем статистику для дашборда
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Параллельно загружаем все данные для статистики
        const [bookingStats, eventStats, userStats] = await Promise.all([
          apiService.getBookingStats(),
          apiService.getEventStats(),
          apiService.getUserStats()
        ]);
        
        if (bookingStats.success && eventStats.success && userStats.success) {
          setStats({
            bookings: bookingStats,
            events: eventStats,
            users: userStats
          });
          setError(null);
        } else {
          setError(t('admin.dashboard.fetchError'));
        }
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
        setError(t('admin.dashboard.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'dashboard') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [activeTab, t]);

  // Проверяем, является ли пользователь администратором
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Функция для рендеринга контента в зависимости от активной вкладки
  const renderContent = () => {
    if (loading) {
      return (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      );
    }

    if (error && activeTab === 'dashboard') {
      return (
        <div className="admin-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => setActiveTab('dashboard')}
          >
            {t('admin.dashboard.retry')}
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <AdminStats stats={stats} />;
      case 'events':
        return <AdminEventsList />;
      case 'venues':
        return <AdminVenuesList />;
      case 'users':
        return <AdminUsersList />;
      case 'bookings':
        return <AdminBookings />;
      case 'notifications':
        return <AdminNotifications />;
      default:
        return <AdminStats stats={stats} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        <div className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>Quicket</h2>
            <p className="admin-role-badge">{t('admin.dashboard.adminPanel')}</p>
          </div>
          
          <nav className="admin-sidebar-nav">
            <button 
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="admin-nav-icon">📊</span>
              {t('admin.dashboard.tabs.dashboard')}
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <span className="admin-nav-icon">🎭</span>
              {t('admin.dashboard.tabs.events')}
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'venues' ? 'active' : ''}`}
              onClick={() => setActiveTab('venues')}
            >
              <span className="admin-nav-icon">🏟️</span>
              {t('admin.dashboard.tabs.venues')}
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="admin-nav-icon">🎟️</span>
              {t('admin.dashboard.tabs.bookings')}
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="admin-nav-icon">👥</span>
              {t('admin.dashboard.tabs.users')}
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="admin-nav-icon">🔔</span>
              {t('admin.dashboard.tabs.notifications')}
            </button>
          </nav>
          
          <div className="admin-sidebar-footer">
            <div className="admin-user-info">
              <div className="admin-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="admin-user-details">
                <p className="admin-username">{user.username || 'Admin'}</p>
                <p className="admin-email">{user.email || 'admin@quicket.kz'}</p>
              </div>
            </div>
            
            <div className="admin-actions">
              <Link to="/" className="admin-action-button">
                <span className="admin-action-icon">🏠</span>
                {t('admin.dashboard.backToSite')}
              </Link>
              
              <button className="admin-action-button logout">
                <span className="admin-action-icon">🚪</span>
                {t('admin.dashboard.logout')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="admin-content">
          <div className="admin-content-header">
            <h1 className="admin-page-title">
              {activeTab === 'dashboard' && t('admin.dashboard.tabs.dashboard')}
              {activeTab === 'events' && t('admin.dashboard.tabs.events')}
              {activeTab === 'venues' && t('admin.dashboard.tabs.venues')}
              {activeTab === 'bookings' && t('admin.dashboard.tabs.bookings')}
              {activeTab === 'users' && t('admin.dashboard.tabs.users')}
              {activeTab === 'notifications' && t('admin.dashboard.tabs.notifications')}
            </h1>
            
            <div className="admin-header-actions">
              {/* Кнопки действий, специфичные для каждой вкладки */}
              {activeTab === 'events' && (
                <button className="admin-add-button">
                  <span className="admin-add-icon">+</span>
                  {t('admin.events.addNew')}
                </button>
              )}
              
              {activeTab === 'venues' && (
                <button className="admin-add-button">
                  <span className="admin-add-icon">+</span>
                  {t('admin.venues.addNew')}
                </button>
              )}
              
              {activeTab === 'notifications' && (
                <button className="admin-action-button">
                  <span className="admin-action-icon">📣</span>
                  {t('admin.notifications.sendNew')}
                </button>
              )}
            </div>
          </div>
          
          <div className="admin-content-body">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;