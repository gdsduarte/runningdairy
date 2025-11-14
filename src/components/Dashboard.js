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
  Stars,
  PeopleAlt,
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

  // Get next 3 upcoming events
  const nextEvents = upcomingEvents.slice(0, 3);

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
        p: isMobile ? 2 : 4,
        maxWidth: isMobile ? "100%" : 1400,
        mx: "auto",
        pb: isMobile ? 10 : 4,
        bgcolor: isMobile ? "background.default" : "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* MOBILE LAYOUT */}
      {isMobile && (
        <>
          {/* Quick Stats */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: "#FFC107",
                  color: "white",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2.5, px: 1 }}>
                  <Box sx={{ fontSize: 32, mb: 0.5 }}>🎯</Box>
                  <Typography
                    variant="h2"
                    sx={{
                      color: "#2c3e50",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {myUpcomingEvents.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#2c3e50",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    My Events
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: "#FFC107",
                  color: "white",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2.5, px: 1 }}>
                  <Box sx={{ fontSize: 32, mb: 0.5 }}>📅</Box>
                  <Typography
                    variant="h2"
                    sx={{
                      color: "#2c3e50",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {upcomingEvents.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#2c3e50",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    Upcoming
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: "#FFC107",
                  color: "white",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2.5, px: 1 }}>
                  <Box sx={{ fontSize: 32, mb: 0.5 }}>🖊️</Box>
                  <Typography
                    variant="h2"
                    sx={{
                      color: "#2c3e50",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {myCreatedEvents.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#2c3e50",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    Created
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Next Upcoming Events */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "1rem",
                fontWeight: 600,
                color: "#2c3e50",
              }}
            >
              <Schedule sx={{ color: "#7C3AED", fontSize: 20 }} /> Next Events
            </Typography>
            {nextEvents.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {nextEvents.map((event) => (
                  <Card
                    key={event.id}
                    sx={{
                      cursor: "pointer",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      bgcolor: "white",
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                        p: 1.5,
                        "&:last-child": { pb: 1.5 },
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f0f0f0",
                          color: theme.palette.primary.main,
                          borderRadius: 2,
                          p: 1,
                          minWidth: 50,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            color: "#7C3AED",
                          }}
                        >
                          {event.date
                            .toLocaleDateString("en-US", { month: "short" })
                            .toUpperCase()}
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: "1.25rem",
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
                          variant="body1"
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#2c3e50",
                            mb: 0.5,
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
                              sx={{ fontSize: "0.7rem", color: "#666" }}
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
                            <DirectionsRun
                              sx={{ fontSize: 14, color: "#F59E0B" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.7rem", color: "#666" }}
                            >
                              {event.distance}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          <Schedule sx={{ fontSize: 12, color: "#DC2626" }} />
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.7rem", color: "#666" }}
                          >
                            {formatTime(event.date)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Box sx={{ fontSize: 32, mb: 2, opacity: 0.5 }}>📅</Box>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    No upcoming events yet
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* My Upcoming Events */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "1rem",
                fontWeight: 600,
                color: "#2c3e50",
              }}
            >
              <CheckCircle sx={{ color: "#EC4899", fontSize: 20 }} />
              Events I'm Attending ({myUpcomingEvents.length})
            </Typography>
            {myUpcomingEvents.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {myUpcomingEvents.map((event) => (
                  <Card
                    key={event.id}
                    sx={{
                      cursor: "pointer",
                      bgcolor: "#D1FAE5",
                      border: "1px solid #86EFAC",
                      borderRadius: 2,
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                        p: 1.5,
                        "&:last-child": { pb: 1.5 },
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f0f0f0",
                          borderRadius: 2,
                          p: 1,
                          minWidth: 50,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            color: "#7C3AED",
                          }}
                        >
                          {event.date
                            .toLocaleDateString("en-US", { month: "short" })
                            .toUpperCase()}
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: "1.25rem",
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
                          variant="body1"
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#2c3e50",
                            mb: 0.5,
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
                              sx={{ fontSize: "0.7rem", color: "#666" }}
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
                            <DirectionsRun
                              sx={{ fontSize: 14, color: "#F59E0B" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.7rem", color: "#666" }}
                            >
                              {event.distance}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          <Schedule sx={{ fontSize: 12, color: "#DC2626" }} />
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.7rem", color: "#666" }}
                          >
                            {formatTime(event.date)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Box sx={{ fontSize: 32, mb: 2, opacity: 0.5 }}>✅</Box>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    You haven't signed up for any events yet
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Events I Created */}
          {myCreatedEvents.length > 0 && (
            <Box>
              <Typography
                variant="h2"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#2c3e50",
                }}
              >
                <Stars sx={{ color: "#F97316", fontSize: 20 }} />
                Events I Created ({myCreatedEvents.length})
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {myCreatedEvents.map((event) => (
                  <Card
                    key={event.id}
                    sx={{
                      cursor: "pointer",
                      bgcolor: "#FED7AA",
                      border: "1px solid #FDBA74",
                      borderRadius: 2,
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                        p: 1.5,
                        "&:last-child": { pb: 1.5 },
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f0f0f0",
                          borderRadius: 2,
                          p: 1,
                          minWidth: 50,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            color: "#7C3AED",
                          }}
                        >
                          {event.date
                            .toLocaleDateString("en-US", { month: "short" })
                            .toUpperCase()}
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: "1.25rem",
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
                          variant="body1"
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#2c3e50",
                            mb: 0.5,
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
                              sx={{ fontSize: "0.7rem", color: "#666" }}
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
                            <PeopleAlt
                              sx={{ fontSize: 14, color: "#6366F1" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.7rem", color: "#666" }}
                            >
                              {event.attendees?.length || 0} attending
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          <Schedule sx={{ fontSize: 12, color: "#DC2626" }} />
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.7rem", color: "#666" }}
                          >
                            {formatTime(event.date)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}

      {/* DESKTOP LAYOUT */}
      {!isMobile && (
        <Box>
          <Grid container spacing={2.5}>
            {/* LEFT COLUMN - Active Events */}
            <Grid item xs={12} md={4.5}>
              {/* Active Events Section */}
              <Card
                sx={{
                  mb: 2.5,
                  boxShadow: { xs: 0, md: 4 },
                  bgcolor: "white",
                  height: "calc(100vh - 64px)",
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
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {nextEvents.map((event) => (
                        <Box
                          key={event.id}
                          sx={{
                            cursor: "pointer",
                            transition: "transform 0.2s",
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
                                width: 140,
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
                </CardContent>
              </Card>
            </Grid>

            {/* MIDDLE COLUMN - Recent Activity & Community */}

                        <Grid item xs={12} md={4}>
              {/* Events I'm Attending Card */}
              <Card
                sx={{
                  mb: 2.5,
                  boxShadow: { xs: 0, md: 4 },
                  bgcolor: "white",
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
                        maxHeight: 320,
                        overflowY: "auto",
                        pr: 0.5,
                      }}
                    >
                      {myUpcomingEvents.slice(0, 3).map((event) => (
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
                  mb: 2.5,
                  boxShadow: { xs: 0, md: 4 },
                  bgcolor: "white",
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
                      Statistics
                    </Typography>
                    <Box
                      sx={{ fontSize: 16, color: "#9ca3af", cursor: "pointer" }}
                    >
                      •••
                    </Box>
                  </Box>

                  {/* Stats Chart */}
                  <Box
                    sx={{
                      height: 180,
                      borderRadius: 2,
                      bgcolor: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 2,
                      position: "relative",
                      mb: 2,
                    }}
                  >
                    {/* Wave Chart */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "10%",
                        right: "10%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <svg
                        width="100%"
                        height="80"
                        viewBox="0 0 300 80"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,40 Q50,15 100,30 T200,40 T300,30"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="3"
                        />
                      </svg>
                    </Box>

                    {/* Date Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        bgcolor: "#374151",
                        color: "white",
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 1,
                        fontSize: "0.688rem",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      <Box sx={{ fontSize: "0.563rem", opacity: 0.7 }}>
                        OCTOBER
                      </Box>
                      <Box sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
                        12
                      </Box>
                    </Box>
                  </Box>

                  {/* Quick Stats */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        py: 1.5,
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
                        {upcomingEvents.length}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 0.5 }}
                      >
                        Total Events
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        py: 1.5,
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
                        Attending
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* RIGHT COLUMN - Events Attending & Statistics */}
            <Grid item xs={12} md={3.5}>
              {/* Recent Activity Card */}
              <Card
                sx={{
                  mb: 2.5,
                  boxShadow: { xs: 0, md: 4 },
                  bgcolor: "white",
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
                      <Typography
                        sx={{ fontSize: "0.813rem", color: "#9ca3af" }}
                      >
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
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
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
                  <Typography
                    sx={{ fontSize: "0.813rem", opacity: 0.9, mb: 2 }}
                  >
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
      )}
    </Box>
  );
}

export default Dashboard;
