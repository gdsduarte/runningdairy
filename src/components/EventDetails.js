import { useState, useEffect } from "react";
import {
  subscribeToEvent,
  rsvpToEvent,
  deleteEvent,
  canEditEvent,
  addToWishlist,
  removeFromWishlist,
  isEventWishlisted,
} from "../services";
import {
  Box,
  Dialog,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  ArrowBack,
  MoreHoriz,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";

function EventDetails({ event, onClose, user, userProfile, onEditEvent }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveEvent, setLiveEvent] = useState(event);
  const [canEdit, setCanEdit] = useState(false);
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleWishlistToggle = async () => {
    if (!user) {
      alert("Please sign in to add events to your wishlist");
      return;
    }

    try {
      if (isWishlisted) {
        const result = await removeFromWishlist(user.uid, event.id);
        if (result.success) {
          setIsWishlisted(false);
        }
      } else {
        const result = await addToWishlist(user.uid, event.id);
        if (result.success) {
          setIsWishlisted(true);
        }
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  // Check if event is wishlisted on mount
  useEffect(() => {
    if (userProfile && event?.id) {
      setIsWishlisted(isEventWishlisted(userProfile, event.id));
    }
  }, [userProfile, event?.id]);

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

  // const formatDate = (date) => {
  //   return date.toLocaleDateString("en-US", {
  //     weekday: "long",
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{
        direction: isMobile ? "up" : "down",
      }}
      PaperProps={{
        sx: {
          maxWidth: 700,
          height: isMobile ? "100%" : "auto",
          maxHeight: isMobile ? "100%" : "90vh",
          m: isMobile ? 0 : 2,
          borderRadius: isMobile ? 0 : 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header with gradient background */}
        <Box
          sx={{
            position: "relative",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            p: isMobile ? 2 : 3,
            pb: 5,
            overflow: "hidden",
          }}
        >
          {/* Header Content */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {liveEvent.name}
              </Typography>
              {isPastEvent && (
                <Chip
                  label="Past Event"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.25)",
                    color: "white",
                    fontWeight: 600,
                    backdropFilter: "blur(10px)",
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {user && (
                <IconButton
                  onClick={handleWishlistToggle}
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                  }}
                >
                  {isWishlisted ? (
                    <Favorite
                      sx={{
                        color: "#f43f5e",
                      }}
                    />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
              )}
              {canEdit && (
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                  }}
                >
                  <MoreHoriz />
                </IconButton>
              )}
              <IconButton
                onClick={onClose}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}
              >
                {isMobile ? <ArrowBack /> : <Close />}
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Admin Menu */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
              boxShadow: 3,
              borderRadius: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onEditEvent(liveEvent);
            }}
            disabled={loading}
          >
            <ListItemIcon>
              <Edit fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Edit Event</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              handleDelete();
            }}
            disabled={loading}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: "error.main" }}>
              Delete Event
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Info Cards */}
        <Box
          sx={{
            position: "relative",
            mt: -3,
            mx: isMobile ? 2 : 3,
            mb: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 1.5,
            zIndex: 2,
          }}
        >
          {/* Date Card */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              p: 1.5,
              boxShadow: isMobile ? 3 : 1,
              border: 1,
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 0.5,
                justifyContent: "center",
              }}
            >
              <CalendarToday
                sx={{
                  fontSize: 24,
                  color: theme.palette.primary.main,
                  mb: 0.5,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Date
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
              {liveEvent.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Typography>
          </Box>

          {/* Time Card */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              p: 1.5,
              boxShadow: isMobile ? 3 : 1,
              border: 1,
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 0.5,
                justifyContent: "center",
              }}
            >
              <Schedule
                sx={{
                  fontSize: 24,
                  color: theme.palette.primary.main,
                  mb: 0.5,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Time
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
              {formatTime(liveEvent.date)}
            </Typography>
          </Box>

          {/* Location Card */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              p: 1.5,
              boxShadow: isMobile ? 3 : 1,
              border: 1,
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 0.5,
                justifyContent: "center",
              }}
            >
              <LocationOn
                sx={{
                  fontSize: 24,
                  color: theme.palette.primary.main,
                  mb: 0.5,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Location
              </Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                mt: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {liveEvent.location}
            </Typography>
          </Box>

          {/* Distance Card */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              p: 1.5,
              boxShadow: isMobile ? 3 : 1,
              border: 1,
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 0.5,
                justifyContent: "center",
              }}
            >
              <DirectionsRun
                sx={{
                  fontSize: 24,
                  color: theme.palette.primary.main,
                  mb: 0.5,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Distance
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
              {liveEvent.distance}
            </Typography>
          </Box>
        </Box>
        {liveEvent.description && (
          <Box
            sx={{
              mx: isMobile ? 2 : 3,
              mb: 2,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              overflowWrap: "break-word",
            }}
          >
            <Typography
              variant="subtitle2"
              color="primary"
              fontWeight={700}
              sx={{ mb: 1 }}
            >
              About this event
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                maxHeight: "4.5em",
                lineHeight: "1.5em",
                overflowY: "auto",
              }}
            >
              {liveEvent.description}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: isMobile ? 2 : 3,
            pb: isMobile ? 2 : 3,
          }}
        >
          <People sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={700}>
            Attendees
          </Typography>
          <Chip
            label={liveEvent.attendees?.length || 0}
            size="small"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "white",
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: isMobile ? 2 : 3,
            pb: isMobile ? 2 : 3,
          }}
        >
          {/* Attendees Section */}
          <Box sx={{ mb: 3 }}>
            {liveEvent.attendees && liveEvent.attendees.length > 0 ? (
              <Box>
                {/* First 5 attendees or all if expanded */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {liveEvent.attendees
                    .slice(0, showAllAttendees ? undefined : 5)
                    .map((attendee, index) => {
                      const isCurrentUser = user && user.uid === attendee.uid;
                      return (
                        <Fade in={true} key={index} timeout={300 + index * 50}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: isCurrentUser
                                ? "rgba(99, 102, 241, 0.08)"
                                : "background.default",
                              border: 1,
                              borderColor: isCurrentUser
                                ? theme.palette.primary.main
                                : "divider",
                              transition: "all 0.2s",
                              "&:hover": {
                                bgcolor: isCurrentUser
                                  ? "rgba(99, 102, 241, 0.12)"
                                  : "action.hover",
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: isCurrentUser
                                  ? theme.palette.primary.main
                                  : theme.palette.secondary.main,
                                width: 44,
                                height: 44,
                                fontWeight: 600,
                              }}
                            >
                              {attendee.displayName?.charAt(0).toUpperCase() ||
                                "U"}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {attendee.displayName}
                                {isCurrentUser && (
                                  <Chip
                                    label="You"
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      height: 20,
                                      fontSize: "0.7rem",
                                      bgcolor: theme.palette.primary.main,
                                      color: "white",
                                    }}
                                  />
                                )}
                              </Typography>
                              {attendee.clubName && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "block",
                                  }}
                                >
                                  {attendee.clubName}
                                </Typography>
                              )}
                            </Box>
                            {isCurrentUser && (
                              <CheckCircle
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontSize: 20,
                                }}
                              />
                            )}
                          </Box>
                        </Fade>
                      );
                    })}
                </Box>

                {/* Show More/Less Button */}
                {liveEvent.attendees.length > 5 && (
                  <Button
                    variant="text"
                    fullWidth
                    onClick={() => setShowAllAttendees(!showAllAttendees)}
                    sx={{
                      mt: 1,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    {showAllAttendees
                      ? "Show Less"
                      : `Show ${liveEvent.attendees.length - 5} More`}
                  </Button>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  bgcolor: "background.default",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <People sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                <Typography color="text.secondary">
                  No one has signed up yet. Be the first!
                </Typography>
              </Box>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Fixed Bottom Actions */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: "divider",
            p: 2,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {!isPastEvent && (
            <>
              {user ? (
                <Button
                  variant={isAttending ? "outlined" : "contained"}
                  fullWidth
                  size="large"
                  startIcon={isAttending ? <CheckCircle /> : null}
                  onClick={handleRSVP}
                  disabled={loading}
                  sx={{
                    borderRadius: 1,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : isAttending ? (
                    "You're Attending"
                  ) : (
                    "RSVP to Event"
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => alert("Please sign in to RSVP")}
                  sx={{ borderRadius: 1, py: 1.5, fontWeight: 600 }}
                >
                  Sign in to RSVP
                </Button>
              )}
            </>
          )}

          {liveEvent.signupLink && (
            <Button
              variant="outlined"
              fullWidth
              size="large"
              endIcon={<OpenInNew />}
              href={liveEvent.signupLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: 1,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Official Registration
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}

export default EventDetails;
