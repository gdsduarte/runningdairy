import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedMonth } from "../store/slices/eventsSlice";
import {
  Box,
  Button,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Chip,
  Dialog,
  Slide,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  ViewList,
  Add,
  LocationOn,
  DirectionsRun,
  Schedule,
  People,
  Close,
  Repeat,
} from "@mui/icons-material";
import {
  responsiveSpacing,
  responsiveSizing,
  componentStyles,
} from "../utils/responsive";

function EventCalendar({ onEventClick, user, onAddEvent }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get events from Redux store
  const events = useSelector((state) => state.events.list);
  const loading = useSelector((state) => state.events.loading);
  const selectedYear = useSelector((state) => state.events.selectedYear);
  const selectedMonth = useSelector((state) => state.events.selectedMonth);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedYear, selectedMonth)
  );
  const [view, setView] = useState("month"); // 'month' or 'list'
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [mobileSelectedDay, setMobileSelectedDay] = useState(null);
  const [dialogExpanded, setDialogExpanded] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // Sync local state with Redux state
  useEffect(() => {
    setCurrentMonth(new Date(selectedYear, selectedMonth));
  }, [selectedYear, selectedMonth]);

  // Update Redux state when month changes
  const setMonthDirectly = (month) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(month);
    setCurrentMonth(newDate);
    dispatch(
      setSelectedMonth({
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
      })
    );
  };

  /* const setYearDirectly = (year) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    dispatch(
      setSelectedMonth({
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
      })
    );
  }; */

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

  const getSelectedDate = (day) => {
    const { year, month } = getDaysInMonth(currentMonth);
    return new Date(year, month, day);
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
    setSelectedDay(day);

    if (isMobile) {
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
        <Box
          key={`header-${index}`}
          sx={{
            textAlign: "center",
            fontWeight: 700,
            color: "text.secondary",
            py: { xs: 0.5, sm: 1 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          }}
        >
          {day}
        </Box>
      );
    });

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<Box key={`empty-${i}`}></Box>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const today = isToday(day);
      const past = isPastDate(day);

      days.push(
        <Box
          key={day}
          onClick={() => handleDayClick(day, dayEvents)}
          sx={{
            minHeight: { xs: 40, sm: 50, md: 70 },
            p: { xs: 0.5, sm: 1 },
            cursor: "pointer",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: past ? 0.4 : 1,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: past ? "transparent" : "#f8f8f8",
              borderRadius: past ? 0 : "4px",
            },
          }}
        >
          <Box
            sx={{
              fontWeight: 400,
              fontSize: { xs: "15px", sm: "14px" },
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              position: "relative",
              bgcolor:
                today && day === selectedDay
                  ? "#0066ff"
                  : today
                  ? "#0066ff"
                  : day === selectedDay && !isMobile
                  ? "#e8e8e8"
                  : "transparent",
              color: today ? "white" : "#666",
            }}
          >
            {day}
          </Box>
          {dayEvents.length > 0 && (
            <Box
              sx={{
                width: { xs: 5, sm: 6 },
                height: { xs: 5, sm: 6 },
                bgcolor: dayEvents.some((e) => e.isRecurring)
                  ? today
                    ? "white"
                    : "#F59E0B"
                  : today
                  ? "white"
                  : "#0066ff",
                borderRadius: "50%",
                position: "absolute",
                bottom: 4,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          )}
        </Box>
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
      <Box sx={{ py: 2 }}>
        {upcomingEvents.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Upcoming Events
            </Typography>
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                onClick={() => onEventClick(event)}
                sx={{
                  mb: 2,
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  <Box
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      borderRadius: 2,
                      p: 2,
                      minWidth: 70,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "white" }}>
                      {event.date.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </Typography>
                    <Typography variant="h3" sx={{ color: "white" }}>
                      {event.date.getDate()}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" gutterBottom>
                      {event.name}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Chip
                        icon={<LocationOn />}
                        label={event.location}
                        size="small"
                      />
                      <Chip
                        icon={<DirectionsRun />}
                        label={event.distance}
                        size="small"
                      />
                      <Chip
                        icon={<Schedule />}
                        label={event.date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        size="small"
                      />
                      <Chip
                        icon={<People />}
                        label={`${event.attendees?.length || 0} attending`}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {pastEvents.length > 0 && (
          <Box>
            <Typography variant="h3" sx={{ mb: 2, color: "text.secondary" }}>
              Past Events
            </Typography>
            {pastEvents.map((event) => (
              <Card
                key={event.id}
                onClick={() => onEventClick(event)}
                sx={{
                  mb: 2,
                  cursor: "pointer",
                  opacity: 0.7,
                  transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                    opacity: 1,
                  },
                }}
              >
                <CardContent
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  <Box
                    sx={{
                      bgcolor: "text.secondary",
                      color: "white",
                      borderRadius: 2,
                      p: 2,
                      minWidth: 70,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "white" }}>
                      {event.date.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </Typography>
                    <Typography variant="h3" sx={{ color: "white" }}>
                      {event.date.getDate()}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" gutterBottom>
                      {event.name}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Chip
                        icon={<LocationOn />}
                        label={event.location}
                        size="small"
                      />
                      <Chip
                        icon={<DirectionsRun />}
                        label={event.distance}
                        size="small"
                      />
                      <Chip
                        icon={<People />}
                        label={`${event.attendees?.length || 0} attended`}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {events.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <DirectionsRun
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography color="text.secondary">
              No events scheduled yet
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography>Loading events...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: isMobile ? "100%" : "80%",
        height: isMobile ? "auto" : "calc(100vh - 64px)",
        bgcolor: "background.default",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: 3,
        mx: "auto",
        my: isMobile ? 0 : 4,
      }}
    >
      {/* Desktop Day Display Card - Yellow Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: 320,
            bgcolor: "#6366f1",
            color: "white",
            display: "flex",
            flexDirection: "column",
            p: responsiveSpacing.pageContainer,
            gap: responsiveSpacing.sectionGap,
            flexShrink: 0,
          }}
        >
          {/* Large Day Number */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography
              sx={{
                fontSize: "8rem !important",
                fontWeight: 700,
                lineHeight: 0.85,
                mb: 1,
              }}
            >
              {selectedDay}
            </Typography>
            <Typography
              sx={{
                fontSize: "2rem",
                fontWeight: 600,
                letterSpacing: "0.3em",
              }}
            >
              {new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                selectedDay
              )
                .toLocaleDateString("en-US", { weekday: "long" })
                .toUpperCase()}
            </Typography>
          </Box>

          {/* Create Event Button */}
          {user && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                const selDate = getSelectedDate(selectedDay);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selDate < today) {
                  alert("You cannot create events in past dates");
                  return;
                }
                onAddEvent(selDate);
              }}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.15)",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.25)",
                },
              }}
            >
              Create an Event
            </Button>
          )}

          {/* Events for selected day */}
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            {getEventsForDay(selectedDay).length > 0 ? (
              <Box>
                {getEventsForDay(selectedDay).map((event) => (
                  <Box
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      position: "relative",
                      "&:hover": {
                        bgcolor: "white",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    {event.isRecurring && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          fontSize: "1rem",
                          opacity: 0.6,
                          color: "#6b7280",
                        }}
                      >
                        <Repeat />
                      </Box>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {event.date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pr: event.isRecurring ? 3 : 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: "#2c3e50" }}
                      >
                        {event.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          mt: 0.5,
                        }}
                      >
                        →
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  color: "white",
                  mt: 4,
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  No events
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Calendar Main Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: isMobile ? 0 : responsiveSpacing.pageContainer,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Mobile: Month Navigation at Top */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 2,
                bgcolor: "background.paper",
              }}
            >
              <IconButton
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentMonth(newDate);
                  dispatch(
                    setSelectedMonth({
                      year: newDate.getFullYear(),
                      month: newDate.getMonth(),
                    })
                  );
                }}
                size="small"
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
              <IconButton
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentMonth(newDate);
                  dispatch(
                    setSelectedMonth({
                      year: newDate.getFullYear(),
                      month: newDate.getMonth(),
                    })
                  );
                }}
                size="small"
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )}

          {/* Mobile: Toggle Buttons */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                px: 2,
                pb: 2,
                bgcolor: "background.paper",
              }}
            >
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(e, newView) => newView && setView(newView)}
                size="small"
                fullWidth
                sx={{ maxWidth: 400 }}
              >
                <ToggleButton value="month">
                  <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                  Calendar
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList fontSize="small" sx={{ mr: 1 }} />
                  List
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {/* Calendar Header - View Toggle - Desktop Only */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              {/* Year Selector - Desktop Only */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 2,
                  mb: 2,
                }}
              >
                <IconButton
                  onClick={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setFullYear(newDate.getFullYear() - 1);
                    setCurrentMonth(newDate);
                    dispatch(
                      setSelectedMonth({
                        year: newDate.getFullYear(),
                        month: newDate.getMonth(),
                      })
                    );
                  }}
                  size="small"
                >
                  <ChevronLeft />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{ minWidth: 60, textAlign: "center" }}
                >
                  {currentMonth.getFullYear()}
                </Typography>
                <IconButton
                  onClick={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setFullYear(newDate.getFullYear() + 1);
                    setCurrentMonth(newDate);
                    dispatch(
                      setSelectedMonth({
                        year: newDate.getFullYear(),
                        month: newDate.getMonth(),
                      })
                    );
                  }}
                  size="small"
                >
                  <ChevronRight />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <ToggleButtonGroup
                  value={view}
                  exclusive
                  onChange={(e, newView) => newView && setView(newView)}
                  size="small"
                >
                  <ToggleButton value="month">
                    <CalendarToday fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ViewList fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          )}

          {/* Month Selector - Desktop Only */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                mb: responsiveSpacing.sectionGap,
              }}
            >
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
                <Button
                  key={month}
                  variant={
                    currentMonth.getMonth() === idx ? "contained" : "text"
                  }
                  size="small"
                  onClick={() => setMonthDirectly(idx)}
                  sx={{
                    minWidth: responsiveSizing.iconMedium,
                    bgcolor:
                      currentMonth.getMonth() === idx
                        ? theme.palette.primary.main
                        : "transparent",
                    color:
                      currentMonth.getMonth() === idx
                        ? "white"
                        : theme.palette.text.secondary,
                    "&:hover": {
                      bgcolor:
                        currentMonth.getMonth() === idx
                          ? theme.palette.primary.dark
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  {month}
                </Button>
              ))}
            </Box>
          )}

          {/* Calendar Grid or List */}
          {view === "month" ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: { xs: 0, sm: 0.5 },
                overflow: "auto",
                px: isMobile ? 2 : 0,
                pb: 2,
                borderBottom: isMobile ? "1px solid #e0e0e0" : "none",
                alignContent: "start",
                minHeight: 0,
              }}
            >
              {renderCalendarView()}
            </Box>
          ) : (
            renderListView()
          )}
        </Box>
      </Box>

      {/* Mobile Day Events Dialog */}
      <Dialog
        open={showDayEvents && mobileSelectedDay !== null}
        onClose={() => setShowDayEvents(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Slide}
        TransitionProps={{
          direction: "up",
        }}
        hideBackdrop={true} // Remove backdrop completely
        sx={{
          zIndex: 1000, // Below the bottom nav bar (which is 1100)
        }}
        PaperProps={{
          sx: {
            ...(isMobile && {
              position: "fixed",
              top: dialogExpanded ? 64 : "50vh", // Account for top app bar (64px) when expanded
              //bottom: 56, // Account for bottom navigation bar
              m: 0,
              borderRadius: "16px 16px 0 0",
              transition: "top 0.3s ease-in-out", // Smooth transition
            }),
          },
        }}
      >
        <Box
          sx={{
            p: responsiveSpacing.modalPadding,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drag Handle */}
          <Box
            onTouchStart={(e) => {
              setDragStart(e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (dragStart !== null) {
                const currentY = e.touches[0].clientY;
                const diff = dragStart - currentY;

                // Swipe up to expand (diff > 50)
                if (diff > 50 && !dialogExpanded) {
                  setDialogExpanded(true);
                  setDragStart(null);
                }
                // Swipe down to collapse (diff < -50)
                else if (diff < -50 && dialogExpanded) {
                  setDialogExpanded(false);
                  setDragStart(null);
                }
              }
            }}
            onTouchEnd={() => setDragStart(null)}
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              py: 1,
              cursor: "grab",
              "&:active": {
                cursor: "grabbing",
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: "divider",
                borderRadius: 2,
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              //mb: 2,
            }}
          >
            <Typography variant="h3">
              {currentMonth.toLocaleDateString("en-US", { month: "long" })}{" "}
              {mobileSelectedDay?.day}
            </Typography>
            {user &&
              !isPastDate(mobileSelectedDay?.day) &&
              mobileSelectedDay?.events.length > 0 && (
                <Button
                  variant="none"
                  startIcon={<Add />}
                  onClick={() => {
                    setShowDayEvents(false);
                    onAddEvent(getSelectedDate(mobileSelectedDay.day));
                  }}
                  sx={{ color: theme.palette.primary.main }}
                >
                  Add Event
                </Button>
              )}
            <IconButton onClick={() => setShowDayEvents(false)}>
              <Close />
            </IconButton>
          </Box>

          {mobileSelectedDay?.events.length > 0 ? (
            <>
              {mobileSelectedDay.events.map((event) => (
                <Card
                  key={event.id}
                  onClick={() => {
                    setShowDayEvents(false);
                    onEventClick(event);
                  }}
                  sx={{
                    mb: 2,
                    cursor: "pointer",
                    position: "relative",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <CardContent>
                    {event.isRecurring && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          fontSize: "1.25rem",
                          opacity: 0.6,
                          color: "#6b7280",
                        }}
                      >
                        <Repeat />
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {event.date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    <Typography variant="h3" gutterBottom>
                      {event.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Chip
                        icon={<LocationOn />}
                        label={event.location}
                        size="small"
                      />
                      <Chip
                        icon={<DirectionsRun />}
                        label={event.distance}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CalendarToday
                sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
              />
              <Typography color="text.secondary" gutterBottom>
                No events scheduled for this day
              </Typography>
              {user && !isPastDate(mobileSelectedDay?.day) && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setShowDayEvents(false);
                    onAddEvent(getSelectedDate(mobileSelectedDay.day));
                  }}
                  sx={{ mt: 2 }}
                >
                  Create an Event
                </Button>
              )}
              {user && isPastDate(mobileSelectedDay?.day) && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  Cannot add event to a past date
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}

export default EventCalendar;
