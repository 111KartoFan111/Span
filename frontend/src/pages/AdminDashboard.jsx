import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import apiService from '../services/api';

import '../styles/AdminDashboard.css';
import '../styles/AdminForm.css';

// Import admin components
import AdminEventForm from '../components/Admin/AdminEventForm';
import AdminEventsList from '../components/Admin/AdminEventsList';
import AdminVenuesList from '../components/Admin/AdminVenuesList';
import AdminStats from '../components/Admin/AdminStats';

const AdminPanel = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  
  // State for modal
  const [showEventModal, setShowEventModal] = useState(false);

  // Fetch statistics for dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const fetchStats = async () => {
        try {
          setLoading(true);
          
          // In a real app, these would be API calls
          // For now we use mock data
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
        } catch (error) {
          console.error('Error fetching statistics:', error);
          setError(t('admin.dashboard.fetchError'));
          setLoading(false);
        }
      };
      
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [activeTab, t]);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Handle event creation
  const handleCreateEvent = () => {
    setShowEventModal(true);
  };

  // Handle event save
  const handleSaveEvent = async (eventData) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call to create an event
      // const response = await apiService.createEvent(eventData, user.token);
      
      // For now, just simulate success and close modal
      setShowEventModal(false);
      
      // If we're on the events tab, we'd refresh the list
      if (activeTab === 'events') {
        // Refresh events list - in real app this would fetch updated data
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating event:', error);
      setLoading(false);
    }
  };

  // Component for dashboard stats overview
  const DashboardOverview = () => (
    <div className="admin-stats-overview">
      <div className="admin-stat-card">
        <div className="admin-stat-icon">🎭</div>
        <div className="admin-stat-details">
          <h3>{t('admin.dashboard.events')}</h3>
          <div className="admin-stat-value">{stats?.events.total_events || 0}</div>
        </div>
      </div>
      
      <div className="admin-stat-card">
        <div className="admin-stat-icon">🎟️</div>
        <div className="admin-stat-details">
          <h3>{t('admin.dashboard.bookings')}</h3>
          <div className="admin-stat-value">{stats?.bookings.total_bookings || 0}</div>
        </div>
      </div>
      
      <div className="admin-stat-card">
        <div className="admin-stat-icon">👥</div>
        <div className="admin-stat-details">
          <h3>{t('admin.dashboard.users')}</h3>
          <div className="admin-stat-value">{stats?.users.total_users || 0}</div>
        </div>
      </div>
    </div>
  );

  // Render appropriate content based on active tab
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
            <p className="admin-role-badge">Admin Panel</p>
          </div>
          
          <nav className="admin-sidebar-nav">
            <button 
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="admin-nav-icon">📊</span>
              Dashboard
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <span className="admin-nav-icon">🎭</span>
              Events
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'venues' ? 'active' : ''}`}
              onClick={() => setActiveTab('venues')}
            >
              <span className="admin-nav-icon">🏟️</span>
              Venues
            </button>

            <button 
              className={`admin-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="admin-nav-icon">🔔</span>
              Notifications
            </button>
            
            <button 
              className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="admin-nav-icon">👥</span>
              Users
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
                Back to Site
              </button>
            </div>
          </div>
        </div>
        
        <div className="admin-content">
          <div className="admin-content-header">
            <h1 className="admin-page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'events' && 'Events Management'}
              {activeTab === 'venues' && 'Venues Management'}
              {activeTab === 'notifications' && 'Notifications Management'}
              {activeTab === 'users' && 'User Management'}
            </h1>
            
            <div className="admin-header-actions">
              {activeTab === 'events' && (
                <button 
                  className="admin-add-button"
                  onClick={handleCreateEvent}
                >
                  <span className="admin-add-icon">+</span>
                  Create New Event
                </button>
              )}
              
              {activeTab === 'venues' && (
                <button 
                  className="admin-add-button"
                  onClick={() => {
                    // Handle adding new venue
                  }}
                >
                  <span className="admin-add-icon">+</span>
                  Add New Venue
                </button>
              )}
            </div>
          </div>
          
          <div className="admin-content-body">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <button 
              className="admin-modal-close"
              onClick={() => setShowEventModal(false)}
            >
              ×
            </button>
            <AdminEventForm 
              onSave={handleSaveEvent}
              onCancel={() => setShowEventModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;