import React, { useState, useEffect } from 'react';
import { subscribeToAuthState, signOut as authSignOut } from './services';
import Auth from './components/Auth';
import AddEvent from './components/AddEvent';
import EventCalendar from './components/EventCalendar';
import EventDetails from './components/EventDetails';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import './css/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar', 'dashboard', or 'profile'

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
                onAddEvent={() => setShowAddEvent(true)}
              />
            )}
            {currentView === 'dashboard' && user && (
              <Dashboard
                user={user}
                onClose={() => setCurrentView('calendar')}
                onEventClick={handleEventClick}
                onAddEvent={() => setShowAddEvent(true)}
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
          onClose={() => setShowAddEvent(false)}
          onEventAdded={() => {
            // Event will be automatically updated via Firestore listener
          }}
        />
      )}

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          user={user}
        />
      )}
    </div>
  );
}

export default App;
