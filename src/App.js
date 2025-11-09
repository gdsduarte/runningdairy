import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { signOut as authSignOut } from './services';
import { useAuthListener } from './store/hooks/useAuthListener';
import { useEventsListener } from './store/hooks/useEventsListener';
import Auth from './components/Auth';
import AddEvent from './components/AddEvent';
import EditEvent from './components/EditEvent';
import EventCalendar from './components/EventCalendar';
import EventDetails from './components/EventDetails';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import './css/App.css';

function App() {
  // Initialize Redux listeners
  useAuthListener();
  useEventsListener();
  
  // Get auth state from Redux
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  
  const [showAuth, setShowAuth] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar', 'dashboard', or 'profile'
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleSignOut = async () => {
    // Confirm before signing out
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;

    try {
      const result = await authSignOut();
      if (!result.success) {
        console.error('Error signing out:', result.error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(null);
    setEditingEvent(event);
  };

  const handleAddEvent = (date) => {
    if (date) {
      const d = new Date(date);
      d.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (d < today) {
        alert('Cannot add events to past dates');
        return;
      }
    }

    setSelectedDate(date);
    setShowAddEvent(true);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <div className={!user ? 'app-content-blurred' : ''}>
        {/* Desktop Sidebar Navigation */}
        {user && (
          <nav className={`desktop-sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-content">
              <button 
                className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
                title="Dashboard"
              >
                <span className="sidebar-icon">📊</span>
                <span className="sidebar-label">Dashboard</span>
              </button>
              <button 
                className={`sidebar-item ${currentView === 'calendar' ? 'active' : ''}`}
                onClick={() => setCurrentView('calendar')}
                title="Calendar"
              >
                <span className="sidebar-icon">📅</span>
                <span className="sidebar-label">Calendar</span>
              </button>
              <button 
                className={`sidebar-item ${currentView === 'profile' ? 'active' : ''}`}
                onClick={() => setCurrentView('profile')}
                title="Profile"
              >
                <span className="sidebar-icon">👤</span>
                <span className="sidebar-label">Profile</span>
              </button>
              <button 
                className="sidebar-item"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <span className="sidebar-icon">🚪</span>
                <span className="sidebar-label">Logout</span>
              </button>
            </div>
            
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <span className="toggle-icon">{sidebarExpanded ? '◀' : '▶'}</span>
            </button>
          </nav>
        )}

        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🏃</span>
              <h1>Running Events Calendar</h1>
            </div>
            
            <nav className="nav-buttons desktop-nav">
              {user ? (
                <>
                  <div className="user-menu">
                    <button 
                      className="btn btn-profile"
                      onClick={() => setCurrentView('profile')}
                    >
                      👤 Profile
                    </button>
                    <button 
                      className="btn btn-signout"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  className="btn btn-signin"
                  onClick={() => setShowAuth(true)}
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </header>

        <main className="main-content">
          <div className="container">
            {currentView === 'calendar' && (
              <EventCalendar 
                onEventClick={handleEventClick}
                user={user}
                onAddEvent={handleAddEvent}
              />
            )}
            {currentView === 'dashboard' && user && (
              <Dashboard
                user={user}
                onClose={() => setCurrentView('calendar')}
                onEventClick={handleEventClick}
                onAddEvent={handleAddEvent}
              />
            )}
            {currentView === 'profile' && user && (
              <Profile
                user={user}
                onClose={() => setCurrentView('calendar')}
              />
            )}
          </div>
        </main>

        <footer className="app-footer">
          <p>© 2025 Running Events Calendar. Built for runners, by runners. 🏃‍♂️🏃‍♀️</p>
        </footer>

        {/* Mobile Bottom Navigation */}
        {user && (
          <nav className="mobile-bottom-nav">
            <button 
              className={`mobile-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
              title="Dashboard"
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Dashboard</span>
            </button>
            <button 
              className={`mobile-nav-item ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={() => setCurrentView('calendar')}
              title="Calendar"
            >
              <span className="nav-icon">📅</span>
              <span className="nav-label">Calendar</span>
            </button>
            <button 
              className={`mobile-nav-item ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentView('profile')}
              title="Profile"
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
            </button>
            <button 
              className="mobile-nav-item"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Logout</span>
            </button>
          </nav>
        )}
      </div>

      {!user && (
        <Auth onClose={null} />
      )}

      {showAuth && user && (
        <Auth onClose={() => setShowAuth(false)} />
      )}

      {showAddEvent && user && (
        <AddEvent 
          user={user}
          selectedDate={selectedDate}
          onClose={() => {
            setShowAddEvent(false);
            setSelectedDate(null);
          }}
          onEventAdded={() => {
            // Event will be automatically updated via Firestore listener
          }}
        />
      )}

      {editingEvent && user && (
        <EditEvent 
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onEventUpdated={() => {
            setEditingEvent(null);
            // Event will be automatically updated via Firestore listener
          }}
        />
      )}

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          user={user}
          onEditEvent={handleEditEvent}
        />
      )}
    </div>
  );
}

export default App;
