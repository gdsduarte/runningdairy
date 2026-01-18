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
  Divider,
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
  EventAvailable,
  Create,
  Favorite,
} from "@mui/icons-material";
import { responsiveSpacing, responsiveSizing } from "../utils/responsive";
import EventStats from "./EventStats";

function EventCalendar({ onEventClick, user, onAddEvent }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get events from Redux store
  const events = useSelector((state) => state.events.list);
  const loading = useSelector((state) => state.events.loading);
  const selectedYear = useSelector((state) => state.events.selectedYear);
  const selectedMonth = useSelector((state) => state.events.selectedMonth);
  const userProfile = useSelector((state) => state.user.profile);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedYear, selectedMonth)
  );
  const [view, setView] = useState("month"); // 'month' or 'list'
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [mobileSelectedDay, setMobileSelectedDay] = useState(null);
  const [dialogExpanded, setDialogExpanded] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedStatType, setSelectedStatType] = useState(null);

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
    const selectedDate = getSelectedDate(day);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate < today;
  };

  // Calculate month stats
  const getMonthStats = () => {
    const { year, month } = getDaysInMonth(currentMonth);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const monthEvents = events.filter((event) => {
      return (
        event.date.getMonth() === month && event.date.getFullYear() === year
      );
    });

    const totalEvents = monthEvents.length;
    const attendingEvents = monthEvents.filter((event) =>
      event.attendees?.some((attendee) => attendee.uid === user?.uid)
    ).length;
    const attendedEvents = monthEvents.filter(
      (event) =>
        event.date < now &&
        event.attendees?.some((attendee) => attendee.uid === user?.uid)
    ).length;
    const createdEvents = monthEvents.filter(
      (event) => event.createdBy === user?.uid
    ).length;
    const wishlistEvents = monthEvents.filter((event) =>
      userProfile?.wishlist?.includes(event.id)
    ).length;

    return {
      totalEvents,
      attendingEvents,
      attendedEvents,
      createdEvents,
      wishlistEvents,
    };
  };

  // Get events for selected stat type
  const getStatEvents = (statType) => {
    const { year, month } = getDaysInMonth(currentMonth);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const monthEvents = events.filter((event) => {
      return (
        event.date.getMonth() === month && event.date.getFullYear() === year
      );
    });

    switch (statType) {
      case "attending":
        return monthEvents.filter((event) =>
          event.attendees?.some((attendee) => attendee.uid === user?.uid)
        );
      case "attended":
        return monthEvents.filter(
          (event) =>
            event.date < now &&
            event.attendees?.some((attendee) => attendee.uid === user?.uid)
        );
      case "created":
        return monthEvents.filter((event) => event.createdBy === user?.uid);
      case "wishlisted":
        return monthEvents.filter((event) =>
          userProfile?.wishlist?.includes(event.id)
        );
      default:
        return [];
    }
  };

  const handleStatClick = (statType) => {
    setSelectedStatType(statType);
    setStatsDialogOpen(true);
  };

  const handleStatsDialogClose = () => {
    setStatsDialogOpen(false);
    setSelectedStatType(null);
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
            py: 1,
            fontSize: { xs: "1rem" },
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
              fontSize: { xs: "1rem" },
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
    const { year, month } = getDaysInMonth(currentMonth);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Filter events for the selected month
    const monthEvents = events.filter((event) => {
      return event.date >= monthStart && event.date <= monthEnd;
    });

    const upcomingEvents = monthEvents.filter(
      (event) => event.date >= new Date()
    );
    const pastEvents = monthEvents
      .filter((event) => event.date < new Date())
      .reverse();

    return (
      <Box
        sx={{
          height: "100%",
          overflowY: "auto",
          py: { xs: 2, md: 0 },
          px: 2,
          bgcolor: "white",
        }}
      >
        {upcomingEvents.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 24,
                  bgcolor: theme.palette.primary.main,
                  borderRadius: 1,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.125rem",
                }}
              >
                Upcoming Events
              </Typography>
              {/* <Chip
                label={upcomingEvents.length}
                size="small"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: 600,
                  height: 24,
                }}
              /> */}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: "1px solid",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      {/* Date Badge */}
                      <Box
                        sx={{
                          minWidth: 90,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          bgcolor: "rgba(99, 102, 241, 0.1)",
                          borderRadius: 1,
                          p: 1,
                          border: "1px solid",
                          borderColor: "rgba(99, 102, 241, 0.2)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            textTransform: "uppercase",
                          }}
                        >
                          {event.date.toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontSize: "1.75rem",
                            fontWeight: 700,
                            lineHeight: 1,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {event.date.getDate()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            textTransform: "uppercase",
                          }}
                        >
                          {event.date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </Typography>
                      </Box>

                      {/* Event Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              mb: 0.5,
                              fontSize: "1rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {event.name}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {userProfile?.wishlist?.includes(event.id) && (
                              <Favorite
                                sx={{
                                  fontSize: 18,
                                  color: "#f43f5e",
                                }}
                              />
                            )}
                            {event.isRecurring && (
                              <Repeat
                                sx={{
                                  fontSize: 18,
                                  color: "text.secondary",
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Schedule
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.875rem",
                                flex: 1,
                              }}
                            >
                              {event.date.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </Typography>
                          </Box>

                          {event.location && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationOn
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flex: 1,
                                }}
                              >
                                {event.location}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    bgcolor: "rgba(16, 185, 129, 0.08)",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                  }}
                                >
                                  <People
                                    sx={{
                                      fontSize: 14,
                                      color: "#10B981",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#10B981",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {event.attendees?.length || 0}{" "}
                                    {/* attending */}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}

                          {event.activityType && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <DirectionsRun
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {event.activityType}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {pastEvents.length > 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 24,
                  bgcolor: "text.secondary",
                  borderRadius: 1,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "text.secondary",
                }}
              >
                Past Events
              </Typography>
              <Chip
                label={pastEvents.length}
                size="small"
                sx={{
                  bgcolor: "rgba(0, 0, 0, 0.08)",
                  color: "text.secondary",
                  fontWeight: 600,
                  height: 24,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {pastEvents.map((event) => (
                <Card
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: "1px solid",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                    opacity: 0.75,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                      opacity: 1,
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Date Badge */}
                      <Box
                        sx={{
                          minWidth: 56,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          bgcolor: "rgba(0, 0, 0, 0.04)",
                          borderRadius: 1.5,
                          p: 1,
                          border: "1px solid",
                          borderColor: "rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            color: "text.secondary",
                            textTransform: "uppercase",
                          }}
                        >
                          {event.date.toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            lineHeight: 1,
                            color: "text.secondary",
                          }}
                        >
                          {event.date.getDate()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.625rem",
                            color: "text.disabled",
                            textTransform: "uppercase",
                          }}
                        >
                          {event.date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </Typography>
                      </Box>

                      {/* Event Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: "1rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {event.name}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Schedule
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.875rem",
                              }}
                            >
                              {event.date.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </Typography>
                          </Box>

                          {event.location && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationOn
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {event.location}
                              </Typography>
                            </Box>
                          )}

                          {event.activityType && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <DirectionsRun
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {event.activityType}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Bottom Info */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              bgcolor: "rgba(0, 0, 0, 0.04)",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            <People
                              sx={{
                                fontSize: 14,
                                color: "text.secondary",
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: "text.secondary",
                                fontSize: "0.75rem",
                              }}
                            >
                              {event.attendees?.length || 0} attended
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {userProfile?.wishlist?.includes(event.id) && (
                              <Favorite
                                sx={{
                                  fontSize: 18,
                                  color: "#f43f5e",
                                }}
                              />
                            )}
                            {event.isRecurring && (
                              <Repeat
                                sx={{
                                  fontSize: 18,
                                  color: "text.secondary",
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {monthEvents.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "rgba(99, 102, 241, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <DirectionsRun
                sx={{ fontSize: 64, color: theme.palette.primary.main }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No events this month
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later or create a new event
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderStats = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 0.75,
          py: 1,
          px: 2,
        }}
      >
        {/* Attending Events */}
        <Box
          onClick={() => handleStatClick("attending")}
          sx={{
            display: "flex",
            alignItems: "center",
            p: 0.75,
            //bgcolor: "rgba(16, 185, 129, 0.08)",
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "rgba(16, 185, 129, 0.2)",
            flexDirection: "column",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(16, 185, 129, 0.08)",
              transform: "translateY(-2px)",
              boxShadow: 1,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <EventAvailable sx={{ color: "#10B981", fontSize: 14 }} />
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.625rem",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              Attending
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.2,
            }}
          >
            {getMonthStats().attendingEvents}
          </Typography>
        </Box>

        {/* Attended Events */}
        <Box
          onClick={() => handleStatClick("attended")}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 0.75,
            //bgcolor: "rgba(139, 92, 246, 0.08)",
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "rgba(139, 92, 246, 0.2)",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(139, 92, 246, 0.08)",
              transform: "translateY(-2px)",
              boxShadow: 1,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <EventAvailable sx={{ color: "#8B5CF6", fontSize: 14 }} />
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.625rem",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              Attended
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.2,
            }}
          >
            {getMonthStats().attendedEvents}
          </Typography>
        </Box>

        {/* Created Events */}
        <Box
          onClick={() => handleStatClick("created")}
          sx={{
            display: "flex",
            alignItems: "center",
            p: 0.75,
            //bgcolor: "rgba(245, 158, 11, 0.08)",
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "rgba(245, 158, 11, 0.2)",
            flexDirection: "column",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(245, 158, 11, 0.08)",
              transform: "translateY(-2px)",
              boxShadow: 1,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Create sx={{ color: "#F59E0B", fontSize: 14 }} />
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.625rem",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              Created
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.2,
            }}
          >
            {getMonthStats().createdEvents}
          </Typography>
        </Box>

        {/* Wishlisted Events */}
        <Box
          onClick={() => handleStatClick("wishlisted")}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 0.75,
            //bgcolor: "rgba(244, 63, 94, 0.08)",
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "rgba(244, 63, 94, 0.2)",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(244, 63, 94, 0.08)",
              transform: "translateY(-2px)",
              boxShadow: 1,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Favorite sx={{ color: "#f43f5e", fontSize: 14 }} />
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.625rem",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              Wishlisted
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.2,
            }}
          >
            {getMonthStats().wishlistEvents}
          </Typography>
        </Box>
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
        height: isMobile ? "100%" : "calc(100vh - 64px)",
        bgcolor: "background.paper",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: isMobile ? "none" : 3,
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
          {user && userProfile?.clubId && (
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
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Mobile: Month Navigation at Top */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              {/* Month Navigation */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 2,
                  color: "white",
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
                  sx={{ color: "white" }}
                >
                  <ChevronLeft />
                </IconButton>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                    <Chip
                      label={`${getMonthStats().totalEvents} events`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.25)",
                        position: "absolute",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 18,
                        ml: 0.5,
                        mt: -1,
                      }}
                    />
                  </Typography>
                </Box>
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
                  sx={{ color: "white" }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>

              {/* Toggle View */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 2,
                  pb: 1,
                }}
              >
                <ToggleButtonGroup
                  value={view}
                  exclusive
                  onChange={(e, newView) => newView && setView(newView)}
                  size="small"
                  fullWidth
                  sx={{ maxWidth: 400, bgcolor: "white" }}
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

              {isMobile && (
                /* view !== "month" && */ <Box
                  sx={{
                    borderBottom: "2px solid",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                  }}
                >
                  {renderStats()}
                </Box>
              )}
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
                    newDate.setMonth(0); // Set to January when changing to previous year
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
                    newDate.setMonth(0); // Set to January when changing to next year
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
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: { xs: 0, sm: 0.5 },
                  overflow: "auto",
                  px: isMobile ? 1 : 0,
                  alignContent: "start",
                }}
              >
                {renderCalendarView()}
              </Box>
              {isMobile && <Divider sx={{ mt: 2, mx: 2 }} />}
              {/* Month Summary Stats - Mobile Only */}
              {/* {isMobile && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 2,
                      pt: 2,
                      pb: 1,
                    }}
                  >
                    <TrendingUp
                      sx={{
                        color: theme.palette.primary.main,
                        fontSize: 16,
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontSize: "0.75rem",
                      }}
                    >
                      This Month
                    </Typography>
                  </Box>

                  {renderStats()}
                </Box>
              )} */}
            </>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0 }}>{renderListView()}</Box>
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
        hideBackdrop={true}
        sx={{
          zIndex: 1000,
        }}
        PaperProps={{
          sx: {
            ...(isMobile && {
              position: "fixed",
              top: dialogExpanded ? 64 : "50vh",
              m: 0,
              borderRadius: "16px 16px 0 0",
              transition: "top 0.3s ease-in-out",
            }),
          },
        }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            p: 2,
            pb: 1,
            position: "relative",
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

                if (diff > 50 && !dialogExpanded) {
                  setDialogExpanded(true);
                  setDragStart(null);
                } else if (diff < -50 && dialogExpanded) {
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
                bgcolor: "rgba(255, 255, 255, 0.3)",
                borderRadius: 1,
              }}
            />
          </Box>

          {/* Day and Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.9,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              >
                {new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  mobileSelectedDay?.day
                )
                  .toLocaleDateString("en-US", { weekday: "long" })
                  .toUpperCase()}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {currentMonth.toLocaleDateString("en-US", { month: "long" })}{" "}
                {mobileSelectedDay?.day}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {user &&
                userProfile?.clubId &&
                !isPastDate(mobileSelectedDay?.day) &&
                mobileSelectedDay?.events.length > 0 && (
                  <IconButton
                    onClick={() => {
                      setShowDayEvents(false);
                      onAddEvent(getSelectedDate(mobileSelectedDay.day));
                    }}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                  >
                    <Add />
                  </IconButton>
                )}
              <IconButton
                onClick={() => setShowDayEvents(false)}
                sx={{ color: "white" }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            height: dialogExpanded
              ? "calc(100vh - 200px)"
              : "calc(50vh - 140px)",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          {mobileSelectedDay?.events.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {mobileSelectedDay.events.map((event) => (
                <Card
                  key={event.id}
                  onClick={() => {
                    setShowDayEvents(false);
                    onEventClick(event);
                  }}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: "1px solid",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      {/* Time Badge */}
                      <Box
                        sx={{
                          minWidth: 80,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          bgcolor: "rgba(99, 102, 241, 0.1)",
                          borderRadius: 1.5,
                          p: 2,
                          border: "1px solid",
                          borderColor: "rgba(99, 102, 241, 0.2)",
                        }}
                      >
                        <Schedule
                          sx={{
                            fontSize: 24,
                            color: theme.palette.primary.main,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          {event.date.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>

                      {/* Event Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              flex: 1,
                            }}
                          >
                            {event.name}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                            {userProfile?.wishlist?.includes(event.id) && (
                              <Favorite
                                sx={{
                                  fontSize: 18,
                                  color: "#f43f5e",
                                }}
                              />
                            )}
                            {event.isRecurring && (
                              <Repeat
                                sx={{
                                  fontSize: 18,
                                  color: "text.secondary",
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            mb: 1,
                          }}
                        >
                          {event.location && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationOn
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {event.location}
                              </Typography>
                            </Box>
                          )}

                          {event.activityType && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <DirectionsRun
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {event.activityType}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Bottom Info */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            bgcolor: "rgba(16, 185, 129, 0.08)",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            width: "fit-content",
                          }}
                        >
                          <People
                            sx={{
                              fontSize: 14,
                              color: "#10B981",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: "#10B981",
                              fontSize: "0.75rem",
                            }}
                          >
                            {event.attendees?.length || 0} attending
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "rgba(16, 185, 129, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <CalendarToday
                  sx={{ fontSize: 32, color: theme.palette.primary.main }}
                />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                No events scheduled
              </Typography>
              {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This day is free
              </Typography> */}
              {user &&
                userProfile?.clubId &&
                !isPastDate(mobileSelectedDay?.day) && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setShowDayEvents(false);
                      onAddEvent(getSelectedDate(mobileSelectedDay.day));
                    }}
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Create Event
                  </Button>
                )}
              {user && isPastDate(mobileSelectedDay?.day) && (
                <Box
                  sx={{
                    bgcolor: "rgba(239, 68, 68, 0.08)",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "error.main",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    Cannot add events to past dates
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Dialog>

      {/* Stats Events Dialog */}
      <EventStats
        open={statsDialogOpen}
        onClose={handleStatsDialogClose}
        statType={selectedStatType}
        events={getStatEvents(selectedStatType)}
        currentMonth={currentMonth}
        onEventClick={onEventClick}
      />
    </Box>
  );
}

export default EventCalendar;
