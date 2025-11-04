import React, { useState, useEffect } from 'react';
import { subscribeToAuthState, signOut as authSignOut } from './services';
import Auth from './components/Auth';
import AddEvent from './components/AddEvent';
import EventCalendar from './components/EventCalendar';
import EventDetails from './components/EventDetails';
import Profile from './components/Profile';
import './css/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
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
            
            <nav className="nav-buttons">
              {user ? (
                <>
                  <div className="user-menu">
                    <button 
                      className="btn btn-profile"
                      onClick={() => setShowProfile(true)}
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
            <EventCalendar 
              onEventClick={handleEventClick}
              user={user}
              onAddEvent={() => setShowAddEvent(true)}
            />
          </div>
        </main>

        <footer className="app-footer">
          <p>© 2025 Running Events Calendar. Built for runners, by runners. 🏃‍♂️🏃‍♀️</p>
        </footer>
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

      {showProfile && user && (
        <Profile
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
