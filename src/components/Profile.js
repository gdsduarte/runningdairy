import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
} from "../services";
import {
  Box,
  Avatar,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { responsiveSpacing } from "../utils/responsive";
import {
  Person,
  CalendarToday,
  EmojiEvents,
  Edit,
  CameraAlt,
  LocationOn,
  DirectionsRun,
  Group,
  Description,
  CheckCircle,
  HourglassEmpty,
} from "@mui/icons-material";

function Profile({ user }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // Get user data from Redux store (already loaded by App.js)
  const reduxProfile = useSelector((state) => state.user.profile);
  const pastEvents = useSelector((state) => state.user.pastEvents);
  const badges = useSelector((state) => state.user.badges);

  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    location: "",
    favoriteDistance: "",
    clubName: "",
  });
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: profile, 1: history, 2: badges
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Update local state when Redux profile changes
  React.useEffect(() => {
    if (reduxProfile) {
      setProfile(reduxProfile);
    } else if (user) {
      setProfile({
        displayName: user.email.split("@")[0],
        bio: "",
        location: "",
        favoriteDistance: "",
        //clubName: "",
      });
    }
  }, [reduxProfile, user]);

  const handleAvatarSelect = () => {
    avatarInputRef.current?.click();
  };

  const handleCoverSelect = () => {
    coverInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // Delete old avatar if exists
      if (profile.avatarPath) {
        await deleteProfileImage(profile.avatarPath);
      }

      // Upload new avatar to Firebase Storage
      const result = await uploadProfileImage(user.uid, file, "avatar");

      if (result.success) {
        const updated = {
          avatarUrl: result.url,
          avatarPath: result.path,
        };
        setProfile({ ...profile, ...updated });
        await updateUserProfile(user.uid, updated);
      } else {
        alert("Failed to upload avatar: " + result.error);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      // Delete old cover if exists
      if (profile.coverPath) {
        await deleteProfileImage(profile.coverPath);
      }

      // Upload new cover to Firebase Storage
      const result = await uploadProfileImage(user.uid, file, "cover");

      if (result.success) {
        const updated = {
          coverUrl: result.url,
          coverPath: result.path,
        };
        setProfile({ ...profile, ...updated });
        await updateUserProfile(user.uid, updated);
      } else {
        alert("Failed to upload cover: " + result.error);
      }
    } catch (error) {
      console.error("Error uploading cover:", error);
      alert("Failed to upload cover");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(user.uid, profile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

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
      {/* Sticky Header Section */}
      <Box sx={{ flexShrink: 0 }}>
        {/* Profile Header with Cover */}
        <Box
          sx={{
            position: "relative",
            height: isMobile ? 150 : 200,
            backgroundImage: profile.coverUrl
              ? `url(${profile.coverUrl})`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #764ba2 100%)`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            mb: isMobile ? 2 : 2,
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)",
              pointerEvents: "none",
            },
          }}
        >
          {isEditing && (
            <IconButton
              onClick={handleCoverSelect}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "action.hover" },
                zIndex: 1,
              }}
            >
              {uploadingCover ? <HourglassEmpty /> : <CameraAlt />}
            </IconButton>
          )}

          {/* Avatar and Name */}
          <Box
            sx={{
              position: "absolute",
              bottom: -25,
              left: isMobile ? 2 : 32,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              width: isMobile ? "calc(100% - 16px)" : "auto",
              zIndex: 1,
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={profile.avatarUrl}
                sx={{
                  width: isMobile ? 100 : 120,
                  height: isMobile ? 100 : 120,
                  border: "4px solid",
                  borderColor: "background.paper",
                  fontSize: isMobile ? "2.5rem" : "3rem",
                  bgcolor: theme.palette.primary.main,
                  cursor: isEditing ? "pointer" : "default",
                }}
                onClick={isEditing ? handleAvatarSelect : undefined}
              >
                {uploadingAvatar ? (
                  <CircularProgress size={40} color="inherit" />
                ) : profile.displayName ? (
                  profile.displayName.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </Avatar>
              {isEditing && (
                <IconButton
                  size="small"
                  onClick={handleAvatarSelect}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Box
              sx={{
                flex: 1,
                pb: 1,
              }}
            >
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: 700,
                  color: "#fff",
                  textShadow:
                    "0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)",
                }}
              >
                {profile.displayName || "Runner"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#fff",
                  textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                  fontWeight: 500,
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>

          {/* Hidden file inputs */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCoverChange}
          />
        </Box>

        {/* Tabs */}
        <Box
          sx={{
            px: isMobile ? 2 : responsiveSpacing.pageContainer,
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                minHeight: isMobile ? 56 : 64,
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              },
            }}
          >
            <Tab
              icon={<Person fontSize={isMobile ? "small" : "medium"} />}
              label="Profile"
              iconPosition="start"
            />
            <Tab
              icon={<CalendarToday fontSize={isMobile ? "small" : "medium"} />}
              label="History"
              iconPosition="start"
            />
            <Tab
              icon={<EmojiEvents fontSize={isMobile ? "small" : "medium"} />}
              label="Badges"
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: isMobile ? 2 : responsiveSpacing.pageContainer,
          py: responsiveSpacing.sectionGap,
        }}
      >
        {/* Profile */}
        {activeTab === 0 && (
          <Box>
            {isEditing ? (
              <Box sx={{ maxWidth: 600 }}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  sx={{ mb: 2 }}
                />
                {/* <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={user.email}
                  disabled
                  sx={{ mb: 2 }}
                /> */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={profile.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Favorite Distance</InputLabel>
                  <Select
                    name="favoriteDistance"
                    value={profile.favoriteDistance}
                    onChange={handleInputChange}
                    label="Favorite Distance"
                  >
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value="5K">5K</MenuItem>
                    <MenuItem value="10K">10K</MenuItem>
                    <MenuItem value="Half Marathon">Half Marathon</MenuItem>
                    <MenuItem value="Marathon">Marathon</MenuItem>
                    <MenuItem value="Ultra">Ultra</MenuItem>
                  </Select>
                </FormControl>
                {/* <TextField
                  fullWidth
                  label="Club Name"
                  name="clubName"
                  value={profile.clubName}
                  onChange={handleInputChange}
                  placeholder="Your running club"
                  disabled
                  sx={{ mb: 3 }}
                /> */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  maxWidth: 800,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                {/* Profile Details - Clean List Style */}
                <Box
                  sx={{
                    mb: 2,
                    borderRadius: isMobile ? 0 : 2,
                    overflow: "hidden",
                  }}
                >
                  {/* Bio */}
                  {profile.bio && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: isMobile ? 2 : 3,
                        borderRadius: isMobile ? 2 : 0,
                        mt: isMobile ? 1 : 2,
                      }}
                    >
                      <Description
                        sx={{
                          color: theme.palette.primary.main,
                          fontSize: isMobile ? 24 : 28,
                          mt: 0.5,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          Bio
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            whiteSpace: "normal",
                          }}
                        >
                          {profile.bio}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Location & Favorite Distance Row */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                    }}
                  >
                    {/* Club */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: isMobile ? 2 : 3,
                        borderRadius: isMobile ? 2 : 0,
                        mt: isMobile ? 1 : 2,
                      }}
                    >
                      <Group
                        sx={{
                          color: theme.palette.primary.main,
                          fontSize: isMobile ? 24 : 28,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          Club
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {profile.clubName}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: isMobile ? 2 : 3,
                        borderRadius: isMobile ? 2 : 0,
                        mt: isMobile ? 1 : 2,
                      }}
                    >
                      <LocationOn
                        sx={{
                          color: theme.palette.primary.main,
                          fontSize: isMobile ? 24 : 28,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          Location
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {profile.location || "Not set"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: isMobile ? 2 : 3,
                        borderRadius: isMobile ? 2 : 0,
                        mt: isMobile ? 1 : 2,
                      }}
                    >
                      <DirectionsRun
                        sx={{
                          color: theme.palette.primary.main,
                          fontSize: isMobile ? 24 : 28,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          Favorite Distance
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {profile.favoriteDistance || "Not set"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    //justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                    fullWidth={isMobile}
                    sx={{
                      position: "relative",
                      "&:hover": { bgcolor: "#4F46E5" },
                      ...(isMobile && { position: "relative", mb: 2 }),
                    }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* History */}
        {activeTab === 1 && (
          <Box>
            {pastEvents.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CalendarToday
                  sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                />
                <Typography color="text.secondary" gutterBottom>
                  No past events yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Attend events to build your running history!
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {pastEvents.map((event) => (
                  <Grid item xs={12} key={event.id}>
                    <Card>
                      <CardContent
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        <Box
                          sx={{
                            bgcolor: "text.secondary",
                            color: "white",
                            borderRadius: 1,
                            p: 2,
                            minWidth: 70,
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="caption" sx={{ color: "white" }}>
                            {event.date.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </Typography>
                          <Typography variant="h3" sx={{ color: "white" }}>
                            {event.date.getDate()}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h3" gutterBottom>
                            {event.name}
                          </Typography>
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
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
                        </Box>
                        <Chip
                          icon={<CheckCircle />}
                          label="Completed"
                          color="success"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {/* Badges */}
        {activeTab === 2 && (
          <Box>
            {badges.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <EmojiEvents
                  sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                />
                <Typography color="text.secondary" gutterBottom>
                  No badges earned yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Attend events to unlock achievements!
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: "primary.main", color: "white" }}>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="h2" sx={{ color: "white" }}>
                          {badges.length}
                        </Typography>
                        <Typography sx={{ color: "white" }}>
                          Badges Earned
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: "secondary.main", color: "white" }}>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="h2" sx={{ color: "white" }}>
                          {pastEvents.length}
                        </Typography>
                        <Typography sx={{ color: "white" }}>
                          Events Completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  {badges.map((badge) => (
                    <Grid item xs={12} sm={6} md={4} key={badge.id}>
                      <Card
                        sx={{
                          borderTop: 3,
                          borderColor: badge.color || "primary.main",
                        }}
                      >
                        <CardContent sx={{ textAlign: "center" }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: "50%",
                              bgcolor: badge.color || "primary.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mx: "auto",
                              mb: 2,
                              fontSize: "2rem",
                            }}
                          >
                            {badge.icon}
                          </Box>
                          <Typography variant="h3" gutterBottom>
                            {badge.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {badge.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Profile;
