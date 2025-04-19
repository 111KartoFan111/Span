import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import apiService from '../services/api';
import AdminEventsList from '../components/Admin/AdminEventsList';
import AdminVenuesList from '../components/Admin/AdminVenuesList';
import AdminUsersList from '../components/Admin/AdminUsersList';
import AdminStats from '../components/Admin/AdminStats';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Загружаем статистику для дашборда
    const fetchStats = async () => {
      try {
        const bookingStats = await apiService.getBookingStats();
        const eventStats = await apiService.getEventStats();
        const userStats = await apiService.getUserStats();
        
        if (bookingStats.success && eventStats.success && userStats.success) {
          setStats({
            bookings: bookingStats,
            events: eventStats,
            users: userStats
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Проверяем, является ли пользователь администратором
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>{t('admin.dashboard.title')}</h1>
        <p className="admin-subtitle">{t('admin.dashboard.welcome', { name: user.username })}</p>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span className="admin-tab-icon">📊</span>
          {t('admin.dashboard.tabs.stats')}
        </button>
        <button 
          className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <span className="admin-tab-icon">🎭</span>
          {t('admin.dashboard.tabs.events')}
        </button>
        <button 
          className={`admin-tab ${activeTab === 'venues' ? 'active' : ''}`}
          onClick={() => setActiveTab('venues')}
        >
          <span className="admin-tab-icon">🏟️</span>
          {t('admin.dashboard.tabs.venues')}
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="admin-tab-icon">👥</span>
          {t('admin.dashboard.tabs.users')}
        </button>
      </div>
      
      <div className="admin-content">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <>
            {activeTab === 'stats' && <AdminStats stats={stats} />}
            {activeTab === 'events' && <AdminEventsList />}
            {activeTab === 'venues' && <AdminVenuesList />}
            {activeTab === 'users' && <AdminUsersList />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;