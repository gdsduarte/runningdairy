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
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
} from "@mui/material";
import { Search, LocationOn, People, DirectionsRun } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { searchClubs, requestToJoinClub, getJoinRequests } from "../services/clubService";
import { useTheme, useMediaQuery } from "@mui/material";
import { responsiveSpacing } from "../utils/responsive";

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
        width: "100%",
        maxWidth: isMobile ? "100%" : 1200,
        mx: "auto",
        p: responsiveSpacing.pageContainer,
      }}
    >
      <Box sx={{ mb: responsiveSpacing.sectionGap }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <DirectionsRun sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h4" component="h1">
            Find Your Running Club
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Search for running clubs in your area and request to join
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ mb: responsiveSpacing.sectionGap }}
      >
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
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : clubs.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No clubs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try a different search term
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={isMobile ? 2 : 3}>
          {clubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {club.name}
                  </Typography>

                  {club.location && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocationOn fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {club.location}
                      </Typography>
                    </Box>
                  )}

                  {club.memberCount !== undefined && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <People fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {club.memberCount} {club.memberCount === 1 ? "member" : "members"}
                      </Typography>
                    </Box>
                  )}

                  {club.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {club.description.length > 100
                        ? `${club.description.substring(0, 100)}...`
                        : club.description}
                    </Typography>
                  )}

                  {isRequestPending(club.id) && (
                    <Chip
                      label="Request Pending"
                      color="warning"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(club)}
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Club Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedClub && (
          <>
            <DialogTitle>
              <Typography variant="h5">{selectedClub.name}</Typography>
            </DialogTitle>
            <DialogContent>
              {selectedClub.location && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body1">{selectedClub.location}</Typography>
                </Box>
              )}

              {selectedClub.memberCount !== undefined && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <People sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body1">
                    {selectedClub.memberCount} {selectedClub.memberCount === 1 ? "member" : "members"}
                  </Typography>
                </Box>
              )}

              {selectedClub.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    About
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedClub.description}
                  </Typography>
                </Box>
              )}

              {selectedClub.contactEmail && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contact
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedClub.contactEmail}
                  </Typography>
                </Box>
              )}

              {isRequestPending(selectedClub.id) && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Your join request is pending approval from the club admin
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={() => setDetailsOpen(false)}>Cancel</Button>
              {!isRequestPending(selectedClub.id) && (
                <Button
                  variant="contained"
                  onClick={() => handleRequestToJoin(selectedClub.id)}
                  disabled={submitting}
                >
                  {submitting ? "Requesting..." : "Request to Join"}
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
