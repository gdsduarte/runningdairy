import React from 'react';
import { useSelector } from 'react-redux';
import '../css/Dashboard.css';

function Dashboard({ user, onClose, onEventClick, onAddEvent }) {
  // Get events from Redux store
  const events = useSelector((state) => state.events.list);
  const loading = useSelector((state) => state.events.loading);

  // Filter events
  const now = new Date();
  const upcomingEvents = events.filter(event => event.date >= now);
  const myUpcomingEvents = upcomingEvents.filter(event => 
    event.attendees?.some(attendee => attendee.uid === user.uid)
  );
  const myCreatedEvents = events.filter(event => 
    event.createdBy === user.uid &&
    event.date >= now
  );

  // Get next 3 upcoming events
  const nextEvents = upcomingEvents.slice(0, 3);

  /* const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }; */

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* <div className="dashboard-header">
            <h2>Dashboard</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div> */}
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-body">
          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{myUpcomingEvents.length}</div>
              <div className="stat-label">My Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{upcomingEvents.length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✏️</div>
              <div className="stat-value">{myCreatedEvents.length}</div>
              <div className="stat-label">Created</div>
            </div>
          </div>

          {/* Next Upcoming Events */}
          <div className="dashboard-section">
            <h3>🔜 Next Events</h3>
            {nextEvents.length > 0 ? (
              <div className="events-list">
                {nextEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="event-item"
                    onClick={() => {
                      onEventClick(event);
                      onClose();
                    }}
                  >
                    <div className="event-date-badge">
                      <div className="month">{event.date.toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="day">{event.date.getDate()}</div>
                    </div>
                    <div className="event-details">
                      <h4>{event.name}</h4>
                      <div className="event-meta">
                        <span>📍 {event.location}</span>
                        <span>🏃 {event.distance}</span>
                      </div>
                      <div className="event-time">⏰ {formatTime(event.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-events">
                <p>No upcoming events yet</p>
              </div>
            )}
          </div>

          {/* My Upcoming Events */}
          <div className="dashboard-section">
            <h3>🎟️ Events I'm Attending ({myUpcomingEvents.length})</h3>
            {myUpcomingEvents.length > 0 ? (
              <div className="events-list">
                {myUpcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="event-item attending"
                    onClick={() => {
                      onEventClick(event);
                      onClose();
                    }}
                  >
                    <div className="event-date-badge">
                      <div className="month">{event.date.toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="day">{event.date.getDate()}</div>
                    </div>
                    <div className="event-details">
                      <h4>{event.name}</h4>
                      <div className="event-meta">
                        <span>📍 {event.location}</span>
                        <span>🏃 {event.distance}</span>
                      </div>
                      <div className="event-time">⏰ {formatTime(event.date)}</div>
                    </div>
                    <div className="attending-badge">✓</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-events">
                <p>You haven't signed up for any events yet</p>
              </div>
            )}
          </div>

          {/* Events I Created */}
          {myCreatedEvents.length > 0 && (
            <div className="dashboard-section">
              <h3>✏️ Events I Created ({myCreatedEvents.length})</h3>
              <div className="events-list">
                {myCreatedEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="event-item created"
                    onClick={() => {
                      onEventClick(event);
                      onClose();
                    }}
                  >
                    <div className="event-date-badge">
                      <div className="month">{event.date.toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="day">{event.date.getDate()}</div>
                    </div>
                    <div className="event-details">
                      <h4>{event.name}</h4>
                      <div className="event-meta">
                        <span>📍 {event.location}</span>
                        <span>👥 {event.attendees?.length || 0} attending</span>
                      </div>
                      <div className="event-time">⏰ {formatTime(event.date)}</div>
                    </div>
                    <div className="creator-badge">👑</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
