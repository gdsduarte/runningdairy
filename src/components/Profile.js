import React, { useState, useRef } from "react";
import { useUserProfileListener } from '../store/hooks/useUserProfileListener';
import { updateUserProfile, uploadProfileImage, deleteProfileImage } from "../services";
import "../css/Profile.css";

function Profile({ user, onClose }) {
  // Get user data from Redux store
  const { profile: reduxProfile, pastEvents, badges, loading } = useUserProfileListener(user?.uid);
  
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    location: "",
    favoriteDistance: "",
    clubName: "",
  });
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'history', 'badges'
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Update local state when Redux profile changes
  React.useEffect(() => {
    if (reduxProfile) {
      setProfile(reduxProfile);
    } else if (user) {
      setProfile({
        displayName: user.email.split("@")[0],
        bio: "",
        location: "",
        favoriteDistance: "",
        clubName: "",
      });
    }
  }, [reduxProfile, user]);

  const handleAvatarSelect = () => {
    avatarInputRef.current?.click();
  };

  const handleCoverSelect = () => {
    coverInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    try {
      // Delete old avatar if exists
      if (profile.avatarPath) {
        await deleteProfileImage(profile.avatarPath);
      }
      
      // Upload new avatar to Firebase Storage
      const result = await uploadProfileImage(user.uid, file, 'avatar');
      
      if (result.success) {
        const updated = { 
          avatarUrl: result.url,
          avatarPath: result.path 
        };
        setProfile({ ...profile, ...updated });
        await updateUserProfile(user.uid, updated);
      } else {
        alert('Failed to upload avatar: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingCover(true);
    try {
      // Delete old cover if exists
      if (profile.coverPath) {
        await deleteProfileImage(profile.coverPath);
      }
      
      // Upload new cover to Firebase Storage
      const result = await uploadProfileImage(user.uid, file, 'cover');
      
      if (result.success) {
        const updated = { 
          coverUrl: result.url,
          coverPath: result.path 
        };
        setProfile({ ...profile, ...updated });
        await updateUserProfile(user.uid, updated);
      } else {
        alert('Failed to upload cover: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Failed to upload cover');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(user.uid, profile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
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
      {/* <button className="close-btn" onClick={onClose}>
        ×
      </button> */}

      {/* Profile Header */}
      <div className="profile-header">
        <div
          className="profile-cover"
          style={profile.coverUrl ? { backgroundImage: `url(${profile.coverUrl})` } : {}}
        >
          {isEditing && (
            <button className="cover-upload-icon" onClick={handleCoverSelect} title="Change cover">
              {uploadingCover ? '⏳' : '📷'}
            </button>
          )}

          <div className="profile-header-content">
            <div 
              className="profile-avatar" 
              onClick={isEditing ? handleAvatarSelect : undefined} 
              title={isEditing ? "Change avatar" : undefined}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
            >
              {uploadingAvatar ? (
                <div className="avatar-uploading">⏳</div>
              ) : profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="avatar-img" />
              ) : (
                (profile.displayName ? profile.displayName.charAt(0).toUpperCase() : "U")
              )}
              {isEditing && <div className="avatar-upload-overlay">✏️</div>}
            </div>
            
            <div className="profile-header-info">
              <h2>{profile.displayName || "Runner"}</h2>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* hidden file inputs */}
        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📅 History ({pastEvents.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "badges" ? "active" : ""}`}
          onClick={() => setActiveTab("badges")}
        >
          🏆 Badges ({badges.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === "profile" && (
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
                <div className="form-group">
                  <label>Club Name</label>
                  <input
                    type="text"
                    name="clubName"
                    value={profile.clubName}
                    onChange={handleInputChange}
                    placeholder="Your running club"
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                  >
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
                      <p>{profile.displayName || "Not set"}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <div className="info-card">
                      <div className="info-icon">📝</div>
                      <div>
                        <strong>Bio</strong>
                        <p>{profile.bio}</p>
                      </div>
                    </div>
                  )}
                  <div className="info-card">
                    <div className="info-icon">📍</div>
                    <div>
                      <strong>Location</strong>
                      <p>{profile.location || "Not set"}</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">🏃</div>
                    <div>
                      <strong>Favorite Distance</strong>
                      <p>{profile.favoriteDistance || "Not set"}</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">🏅</div>
                    <div>
                      <strong>Club</strong>
                      <p>{profile.clubName || "Not set"}</p>
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-tab">
            {pastEvents.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <p>No past events yet</p>
                <small>Attend events to build your running history!</small>
              </div>
            ) : (
              <div className="events-list">
                {pastEvents.map((event) => (
                  <div key={event.id} className="history-event-card">
                    <div className="event-date-badge">
                      <div className="month">
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                        })}
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

        {activeTab === "badges" && (
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
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="badge-card"
                      style={{ borderColor: badge.color }}
                    >
                      <div
                        className="badge-icon"
                        style={{ background: badge.color }}
                      >
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
