import React, { useState, useEffect } from "react";
import { subscribeToEvents } from "../services";
import "../css/EventCalendar.css";

function EventCalendar({ onEventClick, user, onAddEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState("month"); // 'month' or 'list'
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [mobileSelectedDay, setMobileSelectedDay] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((eventsData) => {
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDay = (day) => {
    const { year, month } = getDaysInMonth(currentMonth);
    return events.filter((event) => {
      const eventDate = event.date;
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  const changeMonth = (offset) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    const { year, month } = getDaysInMonth(currentMonth);
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isPastDate = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { year, month } = getDaysInMonth(currentMonth);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  const handleDayClick = (day, dayEvents) => {
    // On desktop, update the yellow card
    setSelectedDay(day);

    // On mobile, always show the modal when clicking a day
    if (window.innerWidth <= 768) {
      setMobileSelectedDay({ day, events: dayEvents });
      setShowDayEvents(true);
    }
  };

  const renderCalendarView = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    // Week day headers
    weekDays.forEach((day, index) => {
      days.push(
        <div key={`header-${index}`} className="calendar-day-header">
          {day}
        </div>
      );
    });

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const today = isToday(day);
      const past = isPastDate(day);

      days.push(
        <div
          key={day}
          className={`calendar-day ${today ? "today" : ""} ${
            past ? "past" : ""
          } ${dayEvents.length > 0 ? "has-events" : ""} ${
            day === selectedDay ? "selected" : ""
          }`}
          onClick={() => handleDayClick(day, dayEvents)}
        >
          <div className="day-number">{day}</div>
          {dayEvents.length > 0 && <span className="event-dot"></span>}
        </div>
      );
    }

    return days;
  };

  const renderListView = () => {
    const upcomingEvents = events.filter((event) => event.date >= new Date());
    const pastEvents = events
      .filter((event) => event.date < new Date())
      .reverse();

    return (
      <div className="list-view">
        {upcomingEvents.length > 0 && (
          <div className="events-section">
            <h3>Upcoming Events</h3>
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="event-card"
                onClick={() => onEventClick(event)}
              >
                <div className="event-date-badge">
                  <div className="month">
                    {event.date.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                  <div className="day">{event.date.getDate()}</div>
                </div>
                <div className="event-info">
                  <h4>{event.name}</h4>
                  <div className="event-details">
                    <span>📍 {event.location}</span>
                    <span>🏃 {event.distance}</span>
                    <span>
                      ⏰{" "}
                      {event.date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="event-attendees">
                    👥 {event.attendees?.length || 0} attending
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pastEvents.length > 0 && (
          <div className="events-section past-section">
            <h3>Past Events</h3>
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="event-card past-event"
                onClick={() => onEventClick(event)}
              >
                <div className="event-date-badge">
                  <div className="month">
                    {event.date.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                  <div className="day">{event.date.getDate()}</div>
                </div>
                <div className="event-info">
                  <h4>{event.name}</h4>
                  <div className="event-details">
                    <span>📍 {event.location}</span>
                    <span>🏃 {event.distance}</span>
                  </div>
                  <div className="event-attendees">
                    👥 {event.attendees?.length || 0} attended
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {events.length === 0 && (
          <div className="no-events">
            <span className="icon">🏃</span>
            <p>No events scheduled yet</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {/* Desktop Day Display Card */}
      <div className="current-day-display">
        <div className="current-day-number">{selectedDay}</div>
        <div className="current-day-name">
          {new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            selectedDay
          )
            .toLocaleDateString("en-US", { weekday: "long" })
            .toUpperCase()}
        </div>

        {user && (
          <button className="btn btn-create-event" onClick={onAddEvent}>
            Create an Event
          </button>
        )}

        {/* Events for selected day */}
        <div className="selected-day-events">
          {getEventsForDay(selectedDay).length > 0 ? (
            <>
              <div className="selected-day-events-header">
                {getEventsForDay(selectedDay).length} Event
                {getEventsForDay(selectedDay).length !== 1 ? "s" : ""}
              </div>
              {getEventsForDay(selectedDay).map((event) => (
                <div
                  key={event.id}
                  className="selected-day-event-item"
                  onClick={() => onEventClick(event)}
                >
                  <div className="event-item-time">
                    {event.date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="event-item-name">{event.name}</div>
                  <div className="event-item-arrow">→</div>
                </div>
              ))}
            </>
          ) : (
            <div className="no-events-message">No events</div>
          )}
        </div>
      </div>

      <div className="calendar-wrapper">
        {/* Year and Month Selector */}
        <div className="calendar-year-month">
          <div className="year-selector">
              <button
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setFullYear(currentMonth.getFullYear() - 1);
                  setCurrentMonth(newDate);
                }}
                className="year-nav"
              >
                ◀
              </button>
              <span className="current-year">{currentMonth.getFullYear()}</span>
              <button
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setFullYear(currentMonth.getFullYear() + 1);
                  setCurrentMonth(newDate);
                }}
                className="year-nav"
              >
                ▶
              </button>
          </div>
          <div className="month-selector">
            <div className="month-tabs">
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((month, idx) => (
                <button
                  key={month}
                  className={`month-tab ${
                    currentMonth.getMonth() === idx ? "active" : ""
                  }`}
                  onClick={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(idx);
                    setCurrentMonth(newDate);
                  }}
                >
                  {month}
                </button>
              ))}
            </div>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${view === "month" ? "active" : ""}`}
                onClick={() => setView("month")}
                title="Calendar View"
              >
                📅
              </button>
              <button
                className={`toggle-btn ${view === "list" ? "active" : ""}`}
                onClick={() => setView("list")}
                title="List View"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="calendar-header">
          <div className="calendar-controls">
            {view === "month" && (
              <>
                <button onClick={() => changeMonth(-1)} className="nav-btn">
                  ◀
                </button>
                <h2 className="month-year">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button onClick={() => changeMonth(1)} className="nav-btn">
                  ▶
                </button>
                {user && (
                  <button className="btn btn-add-event" onClick={onAddEvent}>
                    + Add Event
                  </button>
                )}
              </>
            )}
            {view === "list" && (
              <>
                <h2 className="month-year">All Events</h2>
                {user && (
                  <button className="btn btn-add-event" onClick={onAddEvent}>
                    + Add Event
                  </button>
                )}
              </>
            )}
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === "month" ? "active" : ""}`}
              onClick={() => setView("month")}
            >
              📅 Calendar
            </button>
            <button
              className={`toggle-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              📋 List
            </button>
          </div>
        </div>

        {view === "month" ? (
          <div className="calendar-grid">{renderCalendarView()}</div>
        ) : (
          renderListView()
        )}
      </div>

      {/* Mobile Day Events Modal */}
      {showDayEvents && mobileSelectedDay && (
        <div
          className="day-events-modal"
          onClick={() => setShowDayEvents(false)}
        >
          <div
            className="day-events-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                {currentMonth.toLocaleDateString("en-US", { month: "long" })}{" "}
                {mobileSelectedDay.day}
              </h3>
              {user && mobileSelectedDay.events.length > 0 && (
                <button
                  className="btn-add-event-modal"
                  onClick={() => {
                    setShowDayEvents(false);
                    onAddEvent();
                  }}
                >
                  + Add Event
                </button>
              )}
              <button
                className="close-modal"
                onClick={() => setShowDayEvents(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-events-list">
              {mobileSelectedDay.events.length > 0 ? (
                mobileSelectedDay.events.map((event) => (
                  <div
                    key={event.id}
                    className="modal-event-item"
                    onClick={() => {
                      setShowDayEvents(false);
                      onEventClick(event);
                    }}
                  >
                    <div className="event-time">
                      {event.date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="event-item-info">
                      <h4>{event.name}</h4>
                      <div className="event-item-meta">
                        <span>📍 {event.location}</span>
                        <span>🏃 {event.distance}</span>
                      </div>
                    </div>
                    <div className="event-arrow">›</div>
                  </div>
                ))
              ) : (
                <div className="no-events-modal">
                  <span className="no-events-icon">📅</span>
                  <p>No events scheduled for this day</p>
                  {user && (
                    <button
                      className="btn-create-event-inline"
                      onClick={() => {
                        setShowDayEvents(false);
                        onAddEvent();
                      }}
                    >
                      Create an Event
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventCalendar;
