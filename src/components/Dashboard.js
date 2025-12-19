import React from "react";
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
} from "@mui/icons-material";

function Dashboard({ user, onEventClick, onAddEvent }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Get events from Redux store
  const events = useSelector((state) => state.events.list);
  const loading = useSelector((state) => state.events.loading);

  // Filter events
  const now = new Date();
  const upcomingEvents = events.filter((event) => event.date >= now);
  const myUpcomingEvents = upcomingEvents.filter((event) =>
    event.attendees?.some((attendee) => attendee.uid === user.uid)
  );
  const myCreatedEvents = events.filter(
    (event) => event.createdBy === user.uid && event.date >= now
  );

  // Get next 3 upcoming events (non-recurring)
  const nextEvents = upcomingEvents
    .filter((event) => !event.isRecurring)
    .slice(0, 3);

  // Get recurring events and group them by name to show only next occurrence
  const recurringEvents = upcomingEvents.filter((event) => event.isRecurring);

  // Group recurring events by name and get the next occurrence for each
  const groupedRecurringEvents = recurringEvents.reduce((acc, event) => {
    const key = event.name;
    if (!acc[key] || event.date < acc[key].date) {
      acc[key] = event;
    }
    return acc;
  }, {});

  const nextRecurringEvents = Object.values(groupedRecurringEvents);

  // Calculate monthly statistics: 2 months before, current month, 3 months after
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

    // Loop from 2 months before to 3 months after (total 6 months)
    for (let i = -2; i <= 3; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // All events in this month (past and upcoming)
      const totalEventsInMonth = events.filter((event) => {
        const eventDate =
          event.date instanceof Date ? event.date : new Date(event.date);
        return eventDate >= monthStart && eventDate <= monthEnd;
      });

      // Events user completed in this month (past only)
      const completedEventsInMonth = events.filter((event) => {
        const eventDate =
          event.date instanceof Date ? event.date : new Date(event.date);
        return (
          eventDate >= monthStart &&
          eventDate <= monthEnd &&
          eventDate < now &&
          event.attendees?.some((attendee) => attendee.uid === user.uid)
        );
      });

      months.push({
        name: monthNames[date.getMonth()],
        total: totalEventsInMonth.length,
        completed: completedEventsInMonth.length,
      });
    }

    return months;
  };

  const monthlyStats = getMonthlyStats();
  const maxCount = Math.max(...monthlyStats.map((m) => m.total), 1);

  // Get total events attended (past events)
  const pastEvents = events.filter((event) => {
    const eventDate =
      event.date instanceof Date ? event.date : new Date(event.date);
    return (
      eventDate < now &&
      event.attendees?.some((attendee) => attendee.uid === user.uid)
    );
  });

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
                    Active Events
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#f3f4f6",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
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
                              borderRadius: 2,
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
                            borderRadius: 2,
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
                //minHeight: isMobile ? "auto" : "30%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
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
                      borderRadius: 2,
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
                          borderRadius: 2,
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
                  <Box sx={{ textAlign: "center", py: 4 }}>
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
                //minHeight: isMobile ? "auto" : "30%",
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
                    Activity
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    6 month view
                  </Typography>
                </Box>

                {/* Monthly Bar Chart */}
                <Box
                  sx={{
                    height: 170,
                    borderRadius: 2,
                    bgcolor: "#f9fafb",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                    p: 1.5,
                    gap: 1,
                    mb: 1.5,
                    flexShrink: 0,
                  }}
                >
                  {monthlyStats.map((month, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
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
                            bgcolor: month.total > 0 ? "#e0e7ff" : "#e5e7eb",
                            borderRadius: 1,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Completed Events Bar (Foreground) */}
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height:
                                month.total > 0
                                  ? `${(month.completed / month.total) * 100}%`
                                  : "0%",
                              bgcolor: theme.palette.primary.main,
                              borderRadius: 1,
                              transition: "all 0.3s ease",
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
                            {month.completed}/{month.total}
                          </Box>
                        )}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: "0.688rem",
                          color: "#9ca3af",
                          fontWeight: 500,
                        }}
                      >
                        {month.name}
                      </Typography>
                    </Box>
                  ))}
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
                        bgcolor: "#e0e7ff",
                        borderRadius: 0.5,
                      }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Total Events
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
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {pastEvents.length}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 0.5 }}
                    >
                      Completed
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      py: 1,
                      bgcolor: "#f9fafb",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {myUpcomingEvents.length}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 0.5 }}
                    >
                      Upcoming
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
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {/* Recent Activity Card */}
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
                    Recent Activity
                  </Typography>
                  <Box
                    sx={{ fontSize: 16, color: "#9ca3af", cursor: "pointer" }}
                  >
                    •••
                  </Box>
                </Box>

                {myUpcomingEvents.length > 0 ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {myUpcomingEvents.slice(0, 2).map((event) => (
                      <Box
                        key={event.id}
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "flex-start",
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
                          <Box sx={{ fontSize: 16, color: "white" }}>👤</Box>
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
                            You joined this event
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
                                bgcolor: "#dbeafe",
                                color: "#1e40af",
                                borderRadius: 1,
                                fontSize: "0.688rem",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              View
                            </Box>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                bgcolor: "#10B981",
                                color: "white",
                                borderRadius: 1,
                                fontSize: "0.688rem",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              Confirmed
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Box sx={{ fontSize: 32, mb: 1, opacity: 0.3 }}>💬</Box>
                    <Typography sx={{ fontSize: "0.813rem", color: "#9ca3af" }}>
                      No recent activity
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
                        key={event.id}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.15)",
                          p: 1.5,
                          borderRadius: 1.5,
                          backdropFilter: "blur(10px)",
                        }}
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
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: "rgba(255,255,255,0.25)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Box sx={{ fontSize: 14 }}>👤</Box>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontSize: "0.813rem",
                                fontWeight: 600,
                                mb: 0.3,
                              }}
                            >
                              {user.displayName || "You"}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "0.75rem", opacity: 0.9 }}
                            >
                              Created: {event.name}
                            </Typography>
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
