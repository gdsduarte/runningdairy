import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  EventAvailable,
  CalendarToday,
  Create,
  LocationOn,
  DirectionsRun,
  Schedule,
  CheckCircle,
  Stars,
} from "@mui/icons-material";

function Dashboard({ user, onEventClick, onAddEvent }) {
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
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h1" sx={{ mb: 4, color: "text.primary" }}>
        Dashboard
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <EventAvailable sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h2" sx={{ color: "white" }}>
                {myUpcomingEvents.length}
              </Typography>
              <Typography variant="body1" sx={{ color: "white" }}>
                My Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "secondary.main", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <CalendarToday sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h2" sx={{ color: "white" }}>
                {upcomingEvents.length}
              </Typography>
              <Typography variant="body1" sx={{ color: "white" }}>
                Upcoming
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#4CAF50", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Create sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h2" sx={{ color: "white" }}>
                {myCreatedEvents.length}
              </Typography>
              <Typography variant="body1" sx={{ color: "white" }}>
                Created
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Next Upcoming Events */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <Schedule /> Next Events
        </Typography>
        {nextEvents.length > 0 ? (
          <Grid container spacing={2}>
            {nextEvents.map((event) => (
              <Grid item xs={12} key={event.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => onEventClick(event)}
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
                        minWidth: 80,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "white" }}>
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </Typography>
                      <Typography variant="h2" sx={{ color: "white" }}>
                        {event.date.getDate()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" gutterBottom>
                        {event.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 1,
                        }}
                      >
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
                      <Typography variant="body2" color="text.secondary">
                        <Schedule
                          sx={{
                            fontSize: 16,
                            verticalAlign: "middle",
                            mr: 0.5,
                          }}
                        />
                        {formatTime(event.date)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                No upcoming events yet
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* My Upcoming Events */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <CheckCircle /> Events I'm Attending ({myUpcomingEvents.length})
        </Typography>
        {myUpcomingEvents.length > 0 ? (
          <Grid container spacing={2}>
            {myUpcomingEvents.map((event) => (
              <Grid item xs={12} key={event.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    borderLeft: "4px solid",
                    borderColor: "success.main",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <CardContent
                    sx={{ display: "flex", gap: 2, alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        bgcolor: "success.main",
                        color: "white",
                        borderRadius: 2,
                        p: 2,
                        minWidth: 80,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "white" }}>
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </Typography>
                      <Typography variant="h2" sx={{ color: "white" }}>
                        {event.date.getDate()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" gutterBottom>
                        {event.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 1,
                        }}
                      >
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
                      <Typography variant="body2" color="text.secondary">
                        <Schedule
                          sx={{
                            fontSize: 16,
                            verticalAlign: "middle",
                            mr: 0.5,
                          }}
                        />
                        {formatTime(event.date)}
                      </Typography>
                    </Box>
                    <CheckCircle color="success" sx={{ fontSize: 32 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
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
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Stars /> Events I Created ({myCreatedEvents.length})
          </Typography>
          <Grid container spacing={2}>
            {myCreatedEvents.map((event) => (
              <Grid item xs={12} key={event.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    borderLeft: "4px solid",
                    borderColor: "warning.main",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <CardContent
                    sx={{ display: "flex", gap: 2, alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        bgcolor: "warning.main",
                        color: "white",
                        borderRadius: 2,
                        p: 2,
                        minWidth: 80,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "white" }}>
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </Typography>
                      <Typography variant="h2" sx={{ color: "white" }}>
                        {event.date.getDate()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" gutterBottom>
                        {event.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Chip
                          icon={<LocationOn />}
                          label={event.location}
                          size="small"
                        />
                        <Chip
                          label={`${event.attendees?.length || 0} attending`}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        <Schedule
                          sx={{
                            fontSize: 16,
                            verticalAlign: "middle",
                            mr: 0.5,
                          }}
                        />
                        {formatTime(event.date)}
                      </Typography>
                    </Box>
                    <Stars color="warning" sx={{ fontSize: 32 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
