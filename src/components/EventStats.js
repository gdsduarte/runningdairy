import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  Dialog,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close,
  LocationOn,
  Schedule,
  People,
  Repeat,
  EventAvailable,
  Create,
  Favorite,
} from "@mui/icons-material";

function EventStats({
  open,
  onClose,
  statType,
  events,
  currentMonth,
  onEventClick,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const getStatConfig = () => {
    switch (statType) {
      case "attending":
        return {
          title: "Attending Events",
          icon: <EventAvailable sx={{ fontSize: 32 }} />,
          gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          badgeColor: "#10B981",
          bgColor: "rgba(16, 185, 129, 0.1)",
        };
      case "attended":
        return {
          title: "Attended Events",
          icon: <EventAvailable sx={{ fontSize: 32 }} />,
          gradient: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
          badgeColor: "#8B5CF6",
          bgColor: "rgba(139, 92, 246, 0.1)",
        };
      case "created":
        return {
          title: "Created Events",
          icon: <Create sx={{ fontSize: 32 }} />,
          gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          badgeColor: "#F59E0B",
          bgColor: "rgba(245, 158, 11, 0.1)",
        };
      case "wishlisted":
        return {
          title: "Wishlisted Events",
          icon: <Favorite sx={{ fontSize: 32 }} />,
          gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
          badgeColor: "#f43f5e",
          bgColor: "rgba(244, 63, 94, 0.1)",
        };
      default:
        return {
          title: "Events",
          icon: <EventAvailable sx={{ fontSize: 24 }} />,
          gradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
          badgeColor: "#6366F1",
          bgColor: "rgba(99, 102, 241, 0.1)",
        };
    }
  };

  const config = getStatConfig();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Slide}
      TransitionProps={{
        direction: "right",
      }}
    >
      <Box
        sx={{
          background: config.gradient,
          p: 2,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000,
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {config.icon}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {config.title}
            </Typography>
            {currentMonth && (
              <Typography variant="caption">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: 2,
          flex: 1,
          overflowY: "auto",
          backgroundColor: "background.default",
        }}
      >
        {!events || events.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">No events in this category</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {events.map((event) => (
              <Card
                key={event.id}
                onClick={() => {
                  onClose();
                  onEventClick(event);
                }}
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "center",
                    }}
                  >
                    {/* Date Badge */}
                    <Box
                      sx={{
                        minWidth: 90,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        bgcolor: config.bgColor,
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
                          color: config.badgeColor,
                        }}
                      >
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "1.75rem",
                          fontWeight: 700,
                          lineHeight: 1,
                          color: config.badgeColor,
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
                          {/* {userProfile?.wishlist?.includes(event.id) && (
                          <Favorite
                            sx={{
                              fontSize: 18,
                              color: "#f43f5e",
                            }}
                          />
                        )} */}
                          {event.isRecurring && (
                            <Repeat
                              sx={{
                                fontSize: 18,
                                color: "gray",
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
                      </Box>

                      {/* Badges */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          mt: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* {event.isRecurring && (
                          <Chip
                            icon={<Repeat />}
                            label="Recurring"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              "& .MuiChip-icon": { fontSize: 12 },
                            }}
                          />
                        )} */}
                        {event.activityType && (
                          <Chip
                            label={event.activityType}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

export default EventStats;
