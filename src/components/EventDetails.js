import React, { useState, useEffect } from "react";
import {
  subscribeToEvent,
  rsvpToEvent,
  deleteEvent,
  canEditEvent,
} from "../services";
import {
  Box,
  Modal,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Close,
  CalendarToday,
  Schedule,
  LocationOn,
  DirectionsRun,
  People,
  Edit,
  Delete,
  CheckCircle,
  OpenInNew,
} from "@mui/icons-material";

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
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteEvent(liveEvent.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
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
    <Modal
      open={true}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "90%",
          maxWidth: 700,
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          overflow: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "primary.main",
            color: "white",
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" sx={{ color: "white", mb: 1 }}>
              {liveEvent.name}
            </Typography>
            {isPastEvent && (
              <Chip
                label="Past Event"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
            )}
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Info Section */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <CalendarToday color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(liveEvent.date)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Schedule color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  {formatTime(liveEvent.date)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <LocationOn color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">{liveEvent.location}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <DirectionsRun color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Distance
                </Typography>
                <Typography variant="body1">{liveEvent.distance}</Typography>
              </Box>
            </Box>
          </Box>

          {liveEvent.description && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h3" gutterBottom>
                  About this event
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {liveEvent.description}
                </Typography>
              </Box>
            </>
          )}

          {/* Attendees */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <People color="primary" />
              <Typography variant="h3">
                Attendees ({liveEvent.attendees?.length || 0})
              </Typography>
            </Box>
            {liveEvent.attendees && liveEvent.attendees.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {liveEvent.attendees.map((attendee, index) => {
                  const isCurrentUser = user && user.uid === attendee.uid;
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: isCurrentUser
                          ? "primary.light"
                          : "background.default",
                        border: isCurrentUser ? 2 : 1,
                        borderColor: isCurrentUser ? "primary.main" : "divider",
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {attendee.displayName?.charAt(0).toUpperCase() || "U"}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {attendee.displayName}
                          {isCurrentUser && " (You)"}
                        </Typography>
                        {attendee.clubName && (
                          <Typography variant="body2" color="text.secondary">
                            {attendee.clubName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography color="text.secondary">
                No one has signed up yet. Be the first!
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Admin Actions */}
          {canEdit && (
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => onEditEvent(liveEvent)}
                disabled={loading}
                fullWidth
              >
                Edit Event
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={loading}
                fullWidth
              >
                Delete
              </Button>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {!isPastEvent && (
              <>
                {user ? (
                  <Button
                    variant={isAttending ? "outlined" : "contained"}
                    fullWidth
                    startIcon={isAttending ? <CheckCircle /> : null}
                    onClick={handleRSVP}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : isAttending ? (
                      "Attending"
                    ) : (
                      "RSVP"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => alert("Please sign in to RSVP")}
                  >
                    Sign in to RSVP
                  </Button>
                )}
              </>
            )}

            <Button
              variant="outlined"
              fullWidth
              endIcon={<OpenInNew />}
              href={liveEvent.signupLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Official Registration
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default EventDetails;
