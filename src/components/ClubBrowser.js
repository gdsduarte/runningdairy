import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
} from "@mui/material";
import {
  Search,
  LocationOn,
  People,
  DirectionsRun,
  HourglassEmpty,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  searchClubs,
  requestToJoinClub,
  getJoinRequests,
} from "../services/clubService";
import { useTheme, useMediaQuery } from "@mui/material";

const ClubBrowser = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const user = useSelector((state) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClubs();
    if (user) {
      loadPendingRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError("");
      const clubList = await searchClubs("");
      setClubs(clubList);
    } catch (err) {
      console.error("Error loading clubs:", err);
      setError("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await getJoinRequests(user.uid);
      setPendingRequests(requests.map((r) => r.clubId));
    } catch (err) {
      console.error("Error loading pending requests:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const results = await searchClubs(searchQuery);
      setClubs(results);
    } catch (err) {
      console.error("Error searching clubs:", err);
      setError("Failed to search clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (club) => {
    setSelectedClub(club);
    setDetailsOpen(true);
  };

  const handleRequestToJoin = async (clubId) => {
    try {
      setSubmitting(true);
      setError("");
      await requestToJoinClub(user.uid, clubId);
      setPendingRequests([...pendingRequests, clubId]);
      setDetailsOpen(false);
      setSelectedClub(null);
    } catch (err) {
      console.error("Error requesting to join:", err);
      setError(err.message || "Failed to send join request");
    } finally {
      setSubmitting(false);
    }
  };

  const isRequestPending = (clubId) => pendingRequests.includes(clubId);

  return (
    <Box
      sx={{
        display: "flex",
        width: isMobile ? "100%" : "80%",
        height: isMobile ? "calc(100vh - 110px)" : "calc(100vh - 64px)",
        bgcolor: "background.paper",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: isMobile ? "none" : 3,
        mx: "auto",
        my: isMobile ? 0 : 4,
      }}
    >
      {/* Desktop Card Container */}
      <Box sx={{ flexShrink: 0 }}>
        {/* Header Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            p: isMobile ? 2.5 : 4,
            textAlign: isMobile ? "left" : "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: isMobile ? "flex-start" : "center",
              mb: 1,
            }}
          >
            <DirectionsRun sx={{ fontSize: isMobile ? 32 : 40, mr: 1.5 }} />
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              fontWeight="600"
            >
              Find Your Running Club
            </Typography>
          </Box>
          <Typography
            variant={isMobile ? "body2" : "body1"}
            sx={{ opacity: 0.95 }}
          >
            Search for running clubs in your area and request to join
          </Typography>
        </Box>

        {/* Content Section */}
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          {/* Search Box */}
          <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by club name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "background.paper",
                },
              }}
            />
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : clubs.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <DirectionsRun
                sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No clubs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different search term or be the first to create a club
              </Typography>
            </Box>
          ) : (
            <>
              {/* Results Count */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Found {clubs.length} {clubs.length === 1 ? "club" : "clubs"}
              </Typography>

              {/* Club Cards Grid */}
              <Grid
                container
                spacing={isMobile ? 2 : 3}
                sx={{ display: "flex", justifyContent: isMobile ? "center" : "flex-start" }}
              >
                {clubs.map((club) => (
                  <Grid item xs={12} sm={6} md={4} key={club.id}>
                    <Card
                      elevation={2}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: 6,
                          "& .club-badge": {
                            transform: "rotate(15deg) scale(1.1)",
                          },
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        },
                      }}
                      onClick={() => handleViewDetails(club)}
                    >
                      <CardContent sx={{ flexGrow: 1, pb: 1}}>
                        {/* Club Icon Badge */}
                        <Box
                          className="club-badge"
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            bgcolor: "primary.main",
                            color: "white",
                            borderRadius: "50%",
                            p: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "transform 0.3s ease",
                          }}
                        >
                          <DirectionsRun fontSize="small" />
                        </Box>

                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            pr: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {club.name}
                        </Typography>

                        {club.location && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1.5,
                              color: "text.secondary",
                            }}
                          >
                            <LocationOn
                              fontSize="small"
                              sx={{ mr: 0.5, fontSize: 18 }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {club.location}
                            </Typography>
                          </Box>
                        )}

                        {club.memberCount !== undefined && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                              color: "text.secondary",
                            }}
                          >
                            <People
                              fontSize="small"
                              sx={{ mr: 0.5, fontSize: 18 }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {club.memberCount}{" "}
                              {club.memberCount === 1 ? "member" : "members"}
                            </Typography>
                          </Box>
                        )}

                        {club.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              lineHeight: 1.6,
                            }}
                          >
                            {club.description}
                          </Typography>
                        )}

                        {isRequestPending(club.id) && (
                          <Chip
                            label="Request Pending"
                            color="warning"
                            size="small"
                            icon={<HourglassEmpty />}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>

                      <CardActions
                        sx={{
                          p: 2,
                          pt: 0,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(club);
                          }}
                          fullWidth
                          sx={{
                            borderRadius: 1,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </CardContent>
      </Box>

      {/* Club Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            overflow: "hidden",
          },
        }}
      >
        {selectedClub && (
          <>
            {/* Dialog Header with Gradient */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
                p: 3,
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    p: 1.5,
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DirectionsRun sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {selectedClub.name}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              {selectedClub.location && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                  }}
                >
                  <LocationOn sx={{ mr: 1.5, color: "primary.main" }} />
                  <Typography variant="body1">
                    {selectedClub.location}
                  </Typography>
                </Box>
              )}

              {selectedClub.memberCount !== undefined && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                  }}
                >
                  <People sx={{ mr: 1.5, color: "primary.main" }} />
                  <Typography variant="body1">
                    {selectedClub.memberCount}{" "}
                    {selectedClub.memberCount === 1 ? "member" : "members"}
                  </Typography>
                </Box>
              )}

              {selectedClub.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    About
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {selectedClub.description}
                  </Typography>
                </Box>
              )}

              {selectedClub.contactEmail && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    Contact
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {selectedClub.contactEmail}
                  </Typography>
                </Box>
              )}

              {isRequestPending(selectedClub.id) && (
                <Alert
                  severity="info"
                  icon={<HourglassEmpty />}
                  sx={{ mt: 2, borderRadius: 1 }}
                >
                  Your join request is pending approval from the club admin
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>
                  {error}
                </Alert>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
              <Button
                onClick={() => setDetailsOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Cancel
              </Button>
              {!isRequestPending(selectedClub.id) && (
                <Button
                  variant="contained"
                  onClick={() => handleRequestToJoin(selectedClub.id)}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    boxShadow: 2,
                  }}
                >
                  {submitting ? "Sending..." : "Request to Join"}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ClubBrowser;
