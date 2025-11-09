import React, { useState, useEffect } from "react";
import { subscribeToEvent, rsvpToEvent, deleteEvent, canEditEvent } from "../services";
import "../css/EventDetails.css";

function EventDetails({ event, onClose, user, onEditEvent }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveEvent, setLiveEvent] = useState(event);
  const [canEdit, setCanEdit] = useState(false);

  // Real-time listener for event updates
  useEffect(() => {
    if (!event?.id) return;

    const unsubscribe = subscribeToEvent(event.id, (eventData) => {
      if (eventData) {
        setLiveEvent(eventData);
      }
    });

    return () => unsubscribe();
  }, [event?.id]);

  // Check edit permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (user && liveEvent) {
        const hasPermission = await canEditEvent(liveEvent, user);
        setCanEdit(hasPermission);
      }
    };
    checkPermissions();
  }, [user, liveEvent]);

  if (!liveEvent) return null;

  const isAttending =
    user && liveEvent.attendees?.some((attendee) => attendee.uid === user.uid);

  const isPastEvent = liveEvent.date < new Date();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteEvent(liveEvent.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      alert("Please sign in to RSVP for events");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await rsvpToEvent(
        liveEvent.id,
        user,
        !isAttending,
        liveEvent.attendees || []
      );

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error updating RSVP:", err);
      setError("Failed to update RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="event-details-container">
        <div className="event-header">
          {/* <div className="event-icon-large">🏃</div> */}
          <h2>{liveEvent.name}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          {isPastEvent && <div className="past-badge">Past Event</div>}
        </div>

        <div className="event-content">
          <div className="info-section">
            <div className="info-item">
              <span className="info-icon">📅</span>
              <div className="info-text">
                <strong>Date</strong>
                <p>{formatDate(liveEvent.date)}</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">⏰</span>
              <div className="info-text">
                <strong>Time</strong>
                <p>{formatTime(liveEvent.date)}</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📍</span>
              <div className="info-text">
                <strong>Location</strong>
                <p>{liveEvent.location}</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">🏃</span>
              <div className="info-text">
                <strong>Distance</strong>
                <p>{liveEvent.distance}</p>
              </div>
            </div>
          </div>

          {liveEvent.description && (
            <div className="description-section">
              <h3>About this event</h3>
              <p>{liveEvent.description}</p>
            </div>
          )}

          <div className="attendees-section">
            <h3>👥 Attendees ({liveEvent.attendees?.length || 0})</h3>
            {liveEvent.attendees && liveEvent.attendees.length > 0 ? (
              <div className="attendees-list">
                {liveEvent.attendees.map((attendee, index) => {
                  const isCurrentUser = user && user.uid === attendee.uid;
                  return (
                    <div 
                      key={index} 
                      className={`attendee-card ${isCurrentUser ? 'current-user' : ''}`}
                    >
                      <div className="attendee-avatar">
                        {attendee.displayName?.charAt(0).toUpperCase() || "👤"}
                      </div>
                      <div className="attendee-info">
                        <div className="attendee-name">
                          {attendee.displayName}
                        </div>
                        {attendee.clubName && (
                          <div className="attendee-club">
                            🏅 {attendee.clubName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-attendees">
                No one has signed up yet. Be the first!
              </p>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          {canEdit && (
            <div className="admin-actions">
              <button
                onClick={() => onEditEvent(liveEvent)}
                className="btn btn-edit"
                disabled={loading}
              >
                ✏️ Edit Event
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-delete"
                disabled={loading}
              >
                🗑️ Delete Event
              </button>
            </div>
          )}

          <div className="action-buttons">
            {!isPastEvent && (
              <>
                {user ? (
                  <button
                    onClick={handleRSVP}
                    className={`btn ${
                      isAttending ? "btn-secondary" : "btn-primary"
                    }`}
                    disabled={loading}
                  >
                    {loading
                      ? "Updating..."
                      : isAttending
                      ? "✓ Attending"
                      : "RSVP"}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => alert("Please sign in to RSVP")}
                  >
                    Sign in to RSVP
                  </button>
                )}
              </>
            )}

            <a
              href={liveEvent.signupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-link"
            >
              Official Registration →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
