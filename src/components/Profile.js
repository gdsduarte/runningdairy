import React, { useState, useEffect } from 'react';
import { subscribeToUserProfile, subscribeToUserEvents, updateUserProfile, getUserPastEvents, calculateUserBadges } from '../services';
import '../css/Profile.css';

function Profile({ user, onClose }) {
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    location: '',
    favoriteDistance: '',
  });
  const [pastEvents, setPastEvents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'history', 'badges'

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Real-time listener for user profile
      const unsubscribeProfile = subscribeToUserProfile(user.uid, (profileData) => {
        if (profileData) {
          setProfile(profileData);
        } else {
          // Initialize with user email
          setProfile({
            displayName: user.email.split('@')[0],
            bio: '',
            location: '',
            favoriteDistance: '',
          });
        }
      });

      // Real-time listener for events where user is an attendee
      const unsubscribeEvents = subscribeToUserEvents(user.uid, (userEvents) => {
        // Filter past events
        const past = getUserPastEvents(userEvents);
        setPastEvents(past);

        // Calculate badges
        const earnedBadges = calculateUserBadges(past);
        setBadges(earnedBadges);
      });

      setLoading(false);

      // Return cleanup function
      return () => {
        unsubscribeProfile();
        unsubscribeEvents();
      };
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = loadUserData();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(user.uid, profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <button className="close-btn" onClick={onClose}>×</button>
        
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-header-info">
            <h2>{profile.displayName || 'Runner'}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📅 History ({pastEvents.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            🏆 Badges ({badges.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              {isEditing ? (
                <div className="profile-form">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      name="displayName"
                      value={profile.displayName}
                      onChange={handleInputChange}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="form-group">
                    <label>Favorite Distance</label>
                    <select
                      name="favoriteDistance"
                      value={profile.favoriteDistance}
                      onChange={handleInputChange}
                    >
                      <option value="">Select...</option>
                      <option value="5K">5K</option>
                      <option value="10K">10K</option>
                      <option value="Half Marathon">Half Marathon</option>
                      <option value="Marathon">Marathon</option>
                      <option value="Ultra">Ultra</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveProfile}>
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-view">
                  <div className="profile-info-grid">
                    <div className="info-card">
                      <div className="info-icon">👤</div>
                      <div>
                        <strong>Display Name</strong>
                        <p>{profile.displayName || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-icon">📍</div>
                      <div>
                        <strong>Location</strong>
                        <p>{profile.location || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-icon">🏃</div>
                      <div>
                        <strong>Favorite Distance</strong>
                        <p>{profile.favoriteDistance || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  {profile.bio && (
                    <div className="profile-bio">
                      <strong>Bio</strong>
                      <p>{profile.bio}</p>
                    </div>
                  )}
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              {pastEvents.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📅</span>
                  <p>No past events yet</p>
                  <small>Attend events to build your running history!</small>
                </div>
              ) : (
                <div className="events-list">
                  {pastEvents.map(event => (
                    <div key={event.id} className="history-event-card">
                      <div className="event-date-badge">
                        <div className="month">
                          {event.date.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="day">{event.date.getDate()}</div>
                      </div>
                      <div className="event-info">
                        <h4>{event.name}</h4>
                        <div className="event-meta">
                          <span>📍 {event.location}</span>
                          <span>🏃 {event.distance}</span>
                        </div>
                      </div>
                      <div className="event-status">
                        <span className="completed-badge">✓ Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="badges-tab">
              {badges.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🏆</span>
                  <p>No badges earned yet</p>
                  <small>Attend events to unlock achievements!</small>
                </div>
              ) : (
                <>
                  <div className="badges-stats">
                    <div className="stat-item">
                      <div className="stat-value">{badges.length}</div>
                      <div className="stat-label">Badges Earned</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{pastEvents.length}</div>
                      <div className="stat-label">Events Completed</div>
                    </div>
                  </div>
                  <div className="badges-grid">
                    {badges.map(badge => (
                      <div key={badge.id} className="badge-card" style={{ borderColor: badge.color }}>
                        <div className="badge-icon" style={{ background: badge.color }}>
                          {badge.icon}
                        </div>
                        <h4>{badge.name}</h4>
                        <p>{badge.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
  );
}

export default Profile;
