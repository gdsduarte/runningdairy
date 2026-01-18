import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LocationOn,
  DirectionsRun,
  Schedule,
  CheckCircle,
  Favorite,
  CalendarToday,
} from "@mui/icons-material";

// Helper function to convert distance values to kilometers
function convertDistanceToKm(distance) {
  if (!distance) return 0;

  const distanceMap = {
    "5K": 5,
    "10K": 10,
    "15K": 15,
    "Half Marathon": 21.1,
    Marathon: 42.2,
    Other: 0,
  };

  return distanceMap[distance] || 0;
}

function Dashboard({ user, onEventClick, onAddEvent }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const activityScrollRef = useRef(null);

  // State for selected month in activity bars
  const [selectedMonthStats, setSelectedMonthStats] = useState(null);

  // Get events and userProfile from Redux store
  const events = useSelector((state) => state.events.list);
  const loading = useSelector((state) => state.events.loading);
  const userProfile = useSelector((state) => state.user.profile);

  // Use current date directly for dashboard display (not dependent on calendar navigation)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get the current month's start and end dates
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

  // Get month name for display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[currentMonth];

  // Filter events
  const now = new Date();

  // For Active Events section: show events from current month only
  const selectedMonthEvents = events.filter((event) => {
    const eventDate =
      event.date instanceof Date ? event.date : new Date(event.date);
    return eventDate >= monthStart && eventDate <= monthEnd;
  });
  const upcomingEventsInMonth = selectedMonthEvents.filter(
    (event) => event.date >= now
  );

  // For Events I'm Attending section: show ALL future events I've joined (not filtered by month)
  const allUpcomingEvents = events.filter((event) => event.date >= now);
  const myUpcomingEvents = allUpcomingEvents.filter((event) =>
    event.attendees?.some((attendee) => attendee.uid === user.uid)
  );

  const myCreatedEvents = selectedMonthEvents.filter(
    (event) => event.createdBy === user.uid && event.date >= now
  );

  // Get wishlisted events (all upcoming events in wishlist)
  const wishlistEventIds = userProfile?.wishlist || [];
  const wishlistEvents = allUpcomingEvents.filter((event) =>
    wishlistEventIds.includes(event.id)
  );

  // Get next 3 upcoming events from selected month (non-recurring)
  const nextEvents = upcomingEventsInMonth
    .filter((event) => !event.isRecurring)
    .slice(0, 3);

  // Get recurring events and group them by name to show only next occurrence
  const recurringEvents = upcomingEventsInMonth.filter(
    (event) => event.isRecurring
  );

  // Group recurring events by name and get the next occurrence for each
  const groupedRecurringEvents = recurringEvents.reduce((acc, event) => {
    const key = event.name;
    if (!acc[key] || event.date < acc[key].date) {
      acc[key] = event;
    }
    return acc;
  }, {});

  const nextRecurringEvents = Object.values(groupedRecurringEvents);

  // Calculate monthly statistics: show all months of current and next year
  // This should be based on the CURRENT date, not the selected calendar month
  const getMonthlyStats = () => {
    const months = [];
    const monthNames = [
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
    ];

    // Use current date for activity bars (not selected month from calendar)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();

    // Show all 12 months of the current year plus all 12 months of next year
    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

        // All events in this month (for calculating stats)
        const allEventsInMonth = events.filter((event) => {
          const eventDate =
            event.date instanceof Date ? event.date : new Date(event.date);
          return eventDate >= monthStart && eventDate <= monthEnd;
        });

        // Future events only (for the bar display)
        const totalEventsInMonth = allEventsInMonth.filter((event) => {
          const eventDate =
            event.date instanceof Date ? event.date : new Date(event.date);
          return eventDate >= now;
        });

        // Events user completed (past events user attended)
        const completedEventsInMonth = allEventsInMonth.filter((event) => {
          const eventDate =
            event.date instanceof Date ? event.date : new Date(event.date);
          return (
            eventDate < now &&
            event.attendees?.some((attendee) => attendee.uid === user.uid)
          );
        });

        // Events user will attend (future events user is registered for)
        const upcomingEventsInMonth = allEventsInMonth.filter((event) => {
          const eventDate =
            event.date instanceof Date ? event.date : new Date(event.date);
          return (
            eventDate >= now &&
            event.attendees?.some((attendee) => attendee.uid === user.uid)
          );
        });

        // Calculate distance completed (from events user already completed)
        const completedDistance = completedEventsInMonth.reduce(
          (sum, event) => {
            const distance = convertDistanceToKm(event.distance);
            return sum + distance;
          },
          0
        );

        // Calculate distance upcoming (from events user will attend)
        const upcomingDistance = upcomingEventsInMonth.reduce((sum, event) => {
          const distance = convertDistanceToKm(event.distance);
          return sum + distance;
        }, 0);

        // Calculate total attendees for the month
        const totalAttendees = totalEventsInMonth.reduce((sum, event) => {
          return sum + (event.attendees?.length || 0);
        }, 0);

        months.push({
          name: monthNames[monthIndex],
          year: year,
          total: totalEventsInMonth.length,
          completed: completedEventsInMonth.length,
          upcoming: upcomingEventsInMonth.length,
          completedDistance: completedDistance,
          upcomingDistance: upcomingDistance,
          attendees: totalAttendees,
          isCurrentMonth:
            monthIndex === currentMonthIndex && year === currentYear,
          isFirstMonthOfYear: monthIndex === 0,
        });
      }
    }

    return months;
  };

  const monthlyStats = getMonthlyStats();
  const maxCount = Math.max(...monthlyStats.map((m) => m.total), 1);

  // Get current month from monthlyStats
  const currentMonthData = monthlyStats.find((m) => m.isCurrentMonth);

  // Initialize selectedMonthStats with current month when data is ready
  useEffect(() => {
    // Only set if we have events loaded and currentMonthData exists
    if (events.length > 0 && currentMonthData && !selectedMonthStats) {
      setSelectedMonthStats(currentMonthData);
    }
  }, [
    events.length,
    currentMonthData.name,
    currentMonthData.year,
    currentMonthData,
    selectedMonthStats,
  ]);

  // Always use displayMonth which falls back to current month
  const displayMonth = selectedMonthStats || currentMonthData;

  // Scroll to center the selected month (works on both mobile and desktop)
  useEffect(() => {
    if (
      activityScrollRef.current &&
      selectedMonthStats &&
      monthlyStats.length > 0
    ) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        const scrollContainer = activityScrollRef.current;
        if (scrollContainer) {
          const selectedIndex = monthlyStats.findIndex(
            (m) =>
              m.name === selectedMonthStats.name &&
              m.year === selectedMonthStats.year
          );

          if (selectedIndex !== -1) {
            const monthWidth = 69; // minWidth (60) + gap (9)
            const yearLabelWidth = 58; // year label width (50) + margin (8)

            // Calculate scroll position accounting for year labels
            // Count how many year labels appear before the selected month
            let yearLabelsBeforeSelected = 0;
            for (let i = 0; i < selectedIndex; i++) {
              if (monthlyStats[i].isFirstMonthOfYear) {
                yearLabelsBeforeSelected++;
              }
            }

            const totalWidthBeforeSelected =
              selectedIndex * monthWidth +
              yearLabelsBeforeSelected * yearLabelWidth;
            const scrollPosition =
              totalWidthBeforeSelected -
              scrollContainer.clientWidth / 2 +
              monthWidth / 2;

            scrollContainer.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: "smooth",
            });
          }
        }
      }, 100);
    }
  }, [selectedMonthStats, monthlyStats]);

  // Get total events attended (past events)
  /* const pastEvents = events.filter((event) => {
    const eventDate =
      event.date instanceof Date ? event.date : new Date(event.date);
    return (
      eventDate < now &&
      event.attendees?.some((attendee) => attendee.uid === user.uid)
    );
  }); */

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 3,
        maxWidth: isMobile ? "100%" : 1400,
        mx: "auto",
        pb: isMobile ? 10 : 3,
        bgcolor: isMobile ? "background.default" : "#f5f5f5",
        height: "100vh",
        overflow: isMobile ? "auto" : "hidden",
      }}
    >
      <Box sx={{ height: "100%" }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          {/* LEFT COLUMN - Active Events */}
          <Grid item size={{ xs: 12, md: 4 }}>
            {/* Active Events Section */}
            <Card
              sx={{
                boxShadow: { xs: 0, md: 4 },
                bgcolor: "white",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                ...(isMobile && {
                  height: "auto",
                }),
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2.5,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {currentMonthName} Events
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#f3f4f6",
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#e5e7eb" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#6b7280", fontSize: "0.813rem" }}
                    >
                      All events
                    </Typography>
                  </Box>
                </Box>

                {nextEvents.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      overflowY: "auto",
                      overflowX: "hidden",
                      flex: 1,
                    }}
                  >
                    {nextEvents.slice(0, 3).map((event) => (
                      <Box
                        key={event.id}
                        sx={{
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          borderColor: "black",
                          "&:hover": {
                            transform: "translateX(4px)",
                          },
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            alignItems: "flex-start",
                          }}
                        >
                          {/* Event Image */}
                          <Box
                            sx={{
                              width: "40%",
                              height: 95,
                              borderRadius: 1,
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <Box sx={{ fontSize: 40, opacity: 0.9 }}>🏃</Box>
                            {event.createdBy === user.uid && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 6,
                                  left: 6,
                                  bgcolor: "#FFC107",
                                  color: "#2c3e50",
                                  px: 0.8,
                                  py: 0.3,
                                  borderRadius: 0.5,
                                  fontSize: "0.688rem",
                                  fontWeight: 700,
                                }}
                              >
                                NEW
                              </Box>
                            )}
                          </Box>

                          {/* Event Details */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: "#1f2937",
                                mb: 0.5,
                                lineHeight: 1.3,
                              }}
                            >
                              {event.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#9ca3af",
                                fontSize: "0.813rem",
                                mb: 1,
                              }}
                            >
                              {event.date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>

                            {/* Event Stats */}
                            <Box
                              sx={{
                                display: "flex",
                                gap: 2.5,
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    color: "#ef4444",
                                    fontSize: "0.938rem",
                                  }}
                                >
                                  ❤️
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#6b7280",
                                    fontSize: "0.813rem",
                                  }}
                                >
                                  {event.attendees?.length || 0}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <DirectionsRun
                                  sx={{ fontSize: 16, color: "#F59E0B" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#6b7280",
                                    fontSize: "0.813rem",
                                  }}
                                >
                                  {event.distance}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <Box sx={{ fontSize: 40, mb: 1.5, opacity: 0.3 }}>📅</Box>
                    <Typography
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      No active events yet
                    </Typography>
                  </Box>
                )}

                {/* Recurrent Events Section */}
                <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #e5e7eb" }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ fontSize: "1rem" }}>🔁</Box>
                    Recurrent Events
                  </Typography>
                  {nextRecurringEvents.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {nextRecurringEvents.slice(0, 2).map((event) => (
                        <Box
                          key={event.id}
                          sx={{
                            cursor: "pointer",
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: "#FEF3C7",
                            border: "1px solid #FCD34D",
                            transition: "transform 0.2s",
                            "&:hover": {
                              transform: "translateY(-2px)",
                            },
                          }}
                          onClick={() => onEventClick(event)}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1.5,
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                background:
                                  "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Box sx={{ fontSize: 20, opacity: 0.9 }}>🔁</Box>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                  color: "#1f2937",
                                  mb: 0.3,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {event.name}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.75rem",
                                    color: "#92400e",
                                    fontWeight: 500,
                                  }}
                                >
                                  {event.recurringPattern === "weekly"
                                    ? "Weekly"
                                    : event.recurringPattern === "monthly"
                                    ? "Monthly"
                                    : event.recurringPattern === "daily"
                                    ? "Daily"
                                    : "Recurring"}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <DirectionsRun
                                    sx={{ fontSize: 14, color: "#D97706" }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: "#92400e",
                                    }}
                                  >
                                    {event.distance}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Box sx={{ fontSize: 32, mb: 1, opacity: 0.3 }}>🔁</Box>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: "0.813rem" }}
                      >
                        No recurrent events scheduled
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* MIDDLE COLUMN - Recent Activity & Community */}
          <Grid
            item
            size={{ xs: 12, md: 5 }}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {/* Events I'm Attending Card */}
            <Card
              sx={{
                mb: 2,
                boxShadow: { xs: 0, md: 4 },
                bgcolor: "white",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                ...(isMobile && {
                  minHeight: "fit-content",
                  overflow: "hidden",
                }),
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Events I'm Attending
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#10B981",
                      color: "white",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {myUpcomingEvents.length}
                  </Box>
                </Box>

                {myUpcomingEvents.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      overflowY: "auto",
                      flex: 1,
                      pt: 0.5,
                    }}
                  >
                    {myUpcomingEvents.slice(0, 2).map((event) => (
                      <Box
                        key={event.id}
                        sx={{
                          cursor: "pointer",
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "#D1FAE5",
                          border: "1px solid #86EFAC",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            alignItems: "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: "#f0f0f0",
                              borderRadius: 1.5,
                              p: 1,
                              minWidth: 50,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.625rem",
                                fontWeight: 600,
                                color: "#7C3AED",
                                display: "block",
                              }}
                            >
                              {event.date
                                .toLocaleDateString("en-US", {
                                  month: "short",
                                })
                                .toUpperCase()}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "1.125rem",
                                fontWeight: 700,
                                color: "#2c3e50",
                                lineHeight: 1,
                              }}
                            >
                              {event.date.getDate()}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#1f2937",
                                mb: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {event.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <LocationOn
                                  sx={{ fontSize: 14, color: "#DC2626" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ fontSize: "0.75rem", color: "#666" }}
                                >
                                  {event.location}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Schedule
                                  sx={{ fontSize: 14, color: "#F59E0B" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ fontSize: "0.75rem", color: "#666" }}
                                >
                                  {formatTime(event.date)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <CheckCircle
                            sx={{ fontSize: 20, color: "#10B981" }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Box sx={{ fontSize: 40, mb: 1.5, opacity: 0.3 }}>✅</Box>
                    <Typography
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      You haven't signed up for any events yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, fontSize: "0.75rem" }}
                    >
                      Browse events and RSVP to start your running journey
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card
              sx={{
                boxShadow: { xs: 0, md: 4 },
                bgcolor: "white",
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                ...(isMobile && {
                  minHeight: "fit-content",
                  overflow: "hidden",
                }),
              }}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  overflow: "auto",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2.5,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: "0.938rem",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    My Activity
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    {displayMonth?.name} {displayMonth?.year}
                  </Typography>
                </Box>

                {/* Monthly Bar Chart with Horizontal Scroll */}
                <Box
                  ref={activityScrollRef}
                  sx={{
                    overflowX: "auto",
                    mb: 1.5,
                    "&::-webkit-scrollbar": {
                      height: 6,
                    },
                    "&::-webkit-scrollbar-track": {
                      bgcolor: "#f3f4f6",
                      borderRadius: 1,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "#d1d5db",
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: "#9ca3af",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 170,
                      borderRadius: 1,
                      bgcolor: "#f9fafb",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "flex-start",
                      p: 1.5,
                      gap: 1,
                      minWidth: "max-content",
                      flexShrink: 0,
                    }}
                  >
                    {monthlyStats.map((month, index) => (
                      <React.Fragment key={index}>
                        {/* Year Label - show at the start of each year */}
                        {month.isFirstMonthOfYear && (
                          <Box
                            sx={{
                              minWidth: 50,
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "center",
                              pb: 1,
                              mr: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                color: theme.palette.primary.main,
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                              }}
                            >
                              {month.year}
                            </Typography>
                          </Box>
                        )}

                        <Box
                          onClick={() => setSelectedMonthStats(month)}
                          sx={{
                            minWidth: 60,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                            "&:hover": {
                              opacity: 0.8,
                            },
                          }}
                        >
                          {/* Stacked Bar Container */}
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              position: "relative",
                            }}
                          >
                            {/* Total Events Bar (Background) */}
                            <Box
                              sx={{
                                width: "90%",
                                height:
                                  maxCount > 0
                                    ? `${(month.total / maxCount) * 100}px`
                                    : "4px",
                                minHeight: "4px",
                                bgcolor:
                                  month.total > 0 ? "#e5e7eb" : "#e5e7eb",
                                borderRadius: 1,
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {/* Upcoming Events Bar (Green - Background) */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height:
                                    month.total > 0
                                      ? `${
                                          ((month.completed + month.upcoming) /
                                            month.total) *
                                          100
                                        }%`
                                      : "0%",
                                  bgcolor: "#10B981",
                                  borderRadius: 1,
                                  transition: "all 0.3s ease",
                                }}
                              />
                              {/* Completed Events Bar (Blue - Foreground) */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height:
                                    month.total > 0
                                      ? `${
                                          (month.completed / month.total) * 100
                                        }%`
                                      : "0%",
                                  bgcolor: theme.palette.primary.main,
                                  borderRadius: 1,
                                  transition: "all 0.3s ease",
                                  zIndex: 1,
                                }}
                              />
                            </Box>

                            {/* Count Badge */}
                            {month.total > 0 && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: -20,
                                  fontSize: "0.688rem",
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                }}
                              >
                                {month.completed + month.upcoming}/{month.total}
                              </Box>
                            )}
                          </Box>

                          <Typography
                            sx={{
                              fontSize: "0.688rem",
                              color:
                                displayMonth &&
                                displayMonth.name === month.name &&
                                displayMonth.year === month.year
                                  ? theme.palette.primary.main
                                  : month.isCurrentMonth
                                  ? theme.palette.primary.main
                                  : "#9ca3af",
                              fontWeight:
                                displayMonth &&
                                displayMonth.name === month.name &&
                                displayMonth.year === month.year
                                  ? 700
                                  : month.isCurrentMonth
                                  ? 700
                                  : 500,
                            }}
                          >
                            {month.name}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>

                {/* Legend */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 3,
                    mb: 1.5,
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: theme.palette.primary.main,
                        borderRadius: 0.5,
                      }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Completed
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: "#10B981",
                        borderRadius: 0.5,
                      }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Upcoming
                    </Typography>
                  </Box>
                </Box>

                {/* Quick Stats */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      py: 1,
                      bgcolor: "#f9fafb",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {displayMonth
                        ? `${displayMonth.completedDistance.toFixed(1)} km`
                        : "0 km"}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 0.5 }}
                    >
                      {
                        /* selectedMonthStats ? `${selectedMonthStats.name} ${selectedMonthStats.year} Completed` :  */ "Completed"
                      }
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      py: 1,
                      bgcolor: "#f9fafb",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {displayMonth
                        ? `${displayMonth.upcomingDistance.toFixed(1)} km`
                        : "0 km"}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 0.5 }}
                    >
                      {
                        /* selectedMonthStats ? `${selectedMonthStats.name} ${selectedMonthStats.year} Upcoming` :  */ "Upcoming"
                      }
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT COLUMN - Events Attending & Statistics */}
          <Grid
            item
            size={{ xs: 12, md: 3 }}
            sx={{ height: "100%", display: "flex", flexDirection: "column", 
              ...(isMobile && {
                  //bgcolor: "blue",
                  height: "fit-content",
                  mt: 13,
                  pb: 16,
                }), }}
          >
            {/* Wishlist Card */}
            <Card
              sx={{
                mb: 2,
                boxShadow: { xs: 0, md: 4 },
                bgcolor: "white",
                maxHeight: "50%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ p: 2, flex: 1, overflow: "auto" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Favorite sx={{ color: "#f43f5e", fontSize: 20 }} />
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: "0.938rem",
                        fontWeight: 600,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      My Wishlist
                    </Typography>
                  </Box>
                  <Box
                    sx={{ fontSize: 16, color: "#9ca3af", cursor: "pointer" }}
                  >
                    •••
                  </Box>
                </Box>

                {wishlistEvents.length > 0 ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {wishlistEvents.slice(0, 3).map((event) => (
                      <Box
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "flex-start",
                          cursor: "pointer",
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "#f9fafb",
                            borderColor: "#f43f5e",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(244, 63, 94, 0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            bgcolor: "#fef2f2",
                            border: "2px solid #fecdd3",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#f43f5e",
                              lineHeight: 1,
                            }}
                          >
                            {event.date.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "1.125rem",
                              fontWeight: 700,
                              color: "#991b1b",
                              lineHeight: 1.2,
                            }}
                          >
                            {event.date.getDate()}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#1f2937",
                              mb: 0.5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {event.name}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <LocationOn
                              sx={{ fontSize: 14, color: "#9ca3af" }}
                            />
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {event.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1, mt: 0.8 }}>
                            <Box
                              sx={{
                                px: 1,
                                py: 0.3,
                                bgcolor: "#dbeafe",
                                color: "#1e40af",
                                borderRadius: 0.5,
                                fontSize: "0.688rem",
                                fontWeight: 600,
                              }}
                            >
                              {event.distance}
                            </Box>
                            <Box
                              sx={{
                                px: 1,
                                py: 0.3,
                                bgcolor: "#fef2f2",
                                color: "#f43f5e",
                                borderRadius: 0.5,
                                fontSize: "0.688rem",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Favorite sx={{ fontSize: 12 }} />
                              Saved
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Favorite
                      sx={{ fontSize: 48, color: "#fecdd3", mb: 1 }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#6b7280",
                        mb: 0.5,
                      }}
                    >
                      No events in wishlist
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      Tap the heart icon on events to save them here
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Community Feed Card */}
            <Card
              sx={{
                boxShadow: { xs: 0, md: 4 },
                bgcolor: "#6366f1",
                color: "white",
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ p: 2, overflow: "auto", flex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  Community Feed
                </Typography>
                <Typography sx={{ fontSize: "0.813rem", opacity: 0.9, mb: 2 }}>
                  Connect with other runners
                </Typography>

                {myCreatedEvents.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    {myCreatedEvents.slice(0, 2).map((event) => (
                      <Box
                        key={`created-${event.id}`}
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "flex-start",
                          bgcolor: "#f0f0ff",
                          p: 1.5,
                          borderRadius: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            bgcolor: "#6366f1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Box sx={{ fontSize: 16, color: "white" }}>✨</Box>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontSize: "0.813rem",
                              fontWeight: 600,
                              color: "#1f2937",
                              mb: 0.3,
                            }}
                          >
                            You created an event
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: "#9ca3af",
                              mb: 0.8,
                            }}
                          >
                            {event.name}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                bgcolor: "#6366f1",
                                color: "white",
                                borderRadius: 1,
                                fontSize: "0.688rem",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              Manage
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      p: 2.5,
                      borderRadius: 1.5,
                      textAlign: "center",
                    }}
                  >
                    <Box sx={{ fontSize: 28, mb: 0.5, opacity: 0.7 }}>📢</Box>
                    <Typography sx={{ fontSize: "0.813rem", opacity: 0.9 }}>
                      Create your first event to get started!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
