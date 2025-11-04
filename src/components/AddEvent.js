import React, { useState } from 'react';
import { createEvent } from '../services';
import '../css/AddEvent.css';

function AddEvent({ onClose, onEventAdded }) {
  const [eventData, setEventData] = useState({
    name: '',
    location: '',
    distance: '',
    signupLink: '',
    date: '',
    time: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
      
      const newEvent = {
        name: eventData.name,
        location: eventData.location,
        distance: eventData.distance,
        signupLink: eventData.signupLink,
        description: eventData.description,
        date: eventDateTime,
        attendees: []
      };

      const result = await createEvent(newEvent);
      
      if (result.success) {
        onEventAdded?.();
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Failed to add event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-event-container">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2 className="modal-title">
          <span className="icon">📅</span>
          Add Running Event
        </h2>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-row">
            <div className="form-group">
              <label>Event Name *</label>
              <input
                type="text"
                name="name"
                value={eventData.name}
                onChange={handleChange}
                required
                placeholder="e.g., City Marathon 2025"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={eventData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Central Park, NY"
              />
            </div>

            <div className="form-group">
              <label>Distance *</label>
              <input
                type="text"
                name="distance"
                value={eventData.distance}
                onChange={handleChange}
                required
                placeholder="e.g., 5K, 10K, Half Marathon"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                name="time"
                value={eventData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Registration Link *</label>
              <input
                type="url"
                name="signupLink"
                value={eventData.signupLink}
                onChange={handleChange}
                required
                placeholder="https://example.com/register"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Additional details about the event..."
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEvent;
