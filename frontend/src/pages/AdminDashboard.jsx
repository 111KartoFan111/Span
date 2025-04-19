// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/AdminDashboard.css';

// Импортируем компоненты для админ-панели
import AdminEventsList from '../components/Admin/AdminEventsList';
import AdminVenuesList from '../components/Admin/AdminVenuesList';
import AdminStats from '../components/Admin/AdminStats';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Загрузка статистики для дашборда
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const fetchStats = async () => {
        try {
          setLoading(true);
          
          // В реальном приложении здесь должны быть запросы к API
          // Для примера используем моковые данные
          setTimeout(() => {
            const mockStats = {
              bookings: {
                total_bookings: 152,
                status_stats: { confirmed: 118, cancelled: 34 },
                daily_stats: { "2023-04-15": 12, "2023-04-16": 18, "2023-04-17": 25 },
                top_events: [
                  { id: 1, title: 'Футбол Премьер-лига', bookings_count: 45 },
                  { id: 2, title: 'Баскетбол', bookings_count: 32 },
                  { id: 3, title: 'Волейбол', bookings_count: 24 }
                ]
              },
              events: {
                total_events: 36,
                type_stats: { sport: 15, concert: 8, theater: 5, exhibition: 8 },
                status_stats: { upcoming: 24, ongoing: 5, finished: 3, cancelled: 4 },
                venue_stats: [
                  { id: 1, name: 'Центральный стадион', events_count: 12 },
                  { id: 2, name: 'Дворец спорта', events_count: 8 },
                  { id: 3, name: 'Арена', events_count: 6 }
                ]
              },
              users: {
                total_users: 245,
                admin_count: 3,
                top_users: [
                  { id: 1, username: 'user123', bookings_count: 8 },
                  { id: 2, username: 'sport_fan', bookings_count: 6 },
                  { id: 3, username: 'john_doe', bookings_count: 5 }
                ],
                monthly_stats: { '2023-01': 45, '2023-02': 52, '2023-03': 65 }
              }
            };
            
            setStats(mockStats);
            setLoading(false);
          }, 800);
          
        } catch (error) {
          console.error('Ошибка при загрузке статистики:', error);
          setError(t('admin.dashboard.fetchError'));
          setLoading(false);
        }
      };
      
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [activeTab, t]);

  // Проверяем, является ли пользователь администратором
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Компонент для карточек со статистикой на главной странице админки
  const StatCard = ({ title, value, icon }) => (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-details">
        <h3>{title}</h3>
        <div className="admin-stat-value">{value}</div>
      </div>
    </div>
  );

  // Компонент для отображения обзора статистики
  const DashboardOverview = () => (
    <div className="admin-stats-overview">
      <StatCard 
        title={t('admin.dashboard.events')} 
        value={stats?.events.total_events || 0} 
        icon="🎭" 
      />
      
      <StatCard 
        title={t('admin.dashboard.bookings')} 
        value={stats?.bookings.total_bookings || 0} 
        icon="🎟️" 
      />
      
      <StatCard 
        title={t('admin.dashboard.users')} 
        value={stats?.users.total_users || 0} 
        icon="👥" 
      />
    </div>
  );

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
        return (
          <>
            <DashboardOverview />
            <AdminStats stats={stats} />
          </>
        );
      case 'events':
        return <AdminEventsList />;
      case 'venues':
        return <AdminVenuesList />;
      default:
        return <DashboardOverview />;
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
              <button 
                className="admin-action-button"
                onClick={() => navigate('/')}
              >
                <span className="admin-action-icon">🏠</span>
                {t('admin.dashboard.backToSite')}
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
            </h1>
            
            <div className="admin-header-actions">
              {activeTab === 'events' && (
                <button 
                  className="admin-add-button"
                  onClick={() => {
                    // Тут должен быть код для добавления нового мероприятия
                    console.log('Добавление нового мероприятия');
                  }}
                >
                  <span className="admin-add-icon">+</span>
                  {t('admin.events.addNew')}
                </button>
              )}
              
              {activeTab === 'venues' && (
                <button 
                  className="admin-add-button"
                  onClick={() => {
                    // Тут должен быть код для добавления нового места проведения
                    console.log('Добавление нового места проведения');
                  }}
                >
                  <span className="admin-add-icon">+</span>
                  {t('admin.venues.addNew')}
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