/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Grid,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Delete,
  Edit,
  Cancel,
  PersonAdd,
  Group,
  Email,
  Settings,
  PhotoCamera,
  Business,
  Send,
} from "@mui/icons-material";
import {
  inviteMember,
  getClubMembers,
  getPendingInvitations,
  updateMemberRole,
  removeMember,
  cancelInvitation,
} from "../services";
import { getClubDetails } from "../services/clubService";

function AdminPanel({ user, clubId, userRole }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Permission helpers
  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";

  // Check if current user can edit a member
  const canEditMember = (member) => {
    if (member.uid === user.uid) return false; // Can't edit self
    if (isAdmin) return true; // Admins can edit anyone
    if (isModerator) {
      // Moderators can only edit regular members, not admins or other moderators
      return member.role === "member";
    }
    return false;
  };

  // Check if current user can remove a member
  const canRemoveMember = (member) => {
    if (member.uid === user.uid) return false; // Can't remove self
    if (isAdmin) return true; // Admins can remove anyone
    if (isModerator) {
      // Moderators can only remove regular members
      return member.role === "member";
    }
    return false;
  };

  // Get available roles for invitation
  const getAvailableRoles = () => {
    if (isAdmin) {
      return ["member", "moderator", "admin"];
    }
    // Moderators can only invite as member
    return ["member"];
  };

  // Get available roles for editing
  const getEditableRoles = (member) => {
    if (isAdmin) {
      return ["member", "moderator", "admin"];
    }
    if (isModerator) {
      // Moderators can only change between member and moderator
      return ["member", "moderator"];
    }
    return ["member"];
  };

  const [activeTab, setActiveTab] = useState(0);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [clubData, setClubData] = useState(null);
  const [clubEditMode, setClubEditMode] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: "",
    description: "",
    location: "",
    website: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");

  const [inviteForm, setInviteForm] = useState({
    email: "",
    displayName: "",
    role: "member",
  });

  useEffect(() => {
    if (clubId) {
      loadData();
    }
  }, [clubId]);

  const loadData = async () => {
    if (!clubId) {
      showAlert("error", "Club ID not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [membersResult, invitationsResult, clubResult] = await Promise.all([
        getClubMembers(clubId),
        getPendingInvitations(clubId),
        getClubDetails(clubId),
      ]);

      if (membersResult.success) {
        setMembers(membersResult.members);
      }

      if (invitationsResult.success) {
        setInvitations(invitationsResult.invitations);
      }

      if (clubResult.success) {
        setClubData(clubResult.club);
        setClubForm({
          name: clubResult.club.name || "",
          description: clubResult.club.description || "",
          location: clubResult.club.location || "",
          website: clubResult.club.website || "",
          image: clubResult.club.image || "",
        });
        setImagePreview(clubResult.club.image || "");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showAlert("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
  };

  const handleInviteMember = async () => {
    if (!inviteForm.email || !inviteForm.displayName) {
      showAlert("error", "Please fill in all required fields");
      return;
    }

    // Check if moderator is trying to invite as admin or moderator
    if (isModerator && inviteForm.role !== "member") {
      showAlert("error", "Moderators can only invite members");
      return;
    }

    const result = await inviteMember(inviteForm, clubId, user.uid);

    if (result.success) {
      showAlert("success", result.message || "Invitation email sent successfully!");
      setInviteForm({ email: "", displayName: "", role: "member" });
      setInviteDialogOpen(false);
      loadData();
    } else {
      showAlert("error", result.error);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    // Check if moderator is trying to set admin role
    if (isModerator && selectedMember.role === "admin") {
      showAlert("error", "Moderators cannot assign admin role");
      return;
    }

    const result = await updateMemberRole(
      selectedMember.id,
      selectedMember.role
    );

    if (result.success) {
      showAlert("success", "Member role updated successfully!");
      setEditDialogOpen(false);
      setSelectedMember(null);
      loadData();
    } else {
      showAlert("error", result.error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    const member = members.find((m) => m.id === memberId);

    if (!canRemoveMember(member)) {
      showAlert("error", "You don't have permission to remove this member");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    const result = await removeMember(memberId);

    if (result.success) {
      showAlert("success", "Member removed successfully!");
      loadData();
    } else {
      showAlert("error", result.error);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    const result = await cancelInvitation(invitationId);

    if (result.success) {
      showAlert("success", "Invitation cancelled successfully!");
      loadData();
    } else {
      showAlert("error", result.error);
    }
  };

  const handleResendInvitation = async (invitation) => {
    try {
      const { sendInvitationEmail } = await import('../services/emailService');
      
      // Get club name
      const clubName = clubData?.name || 'Running Club';
      
      const result = await sendInvitationEmail(
        invitation.email,
        invitation.displayName,
        invitation.id,
        clubName
      );

      if (result.success) {
        showAlert("success", "Invitation email resent successfully!");
      } else {
        showAlert("error", "Failed to resend email");
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      showAlert("error", "Failed to resend invitation email");
    }
  };

  const handleUpdateClub = async () => {
    if (!isAdmin) {
      showAlert("error", "Only admins can update club settings");
      return;
    }

    try {
      const { db } = await import("../firebase");
      const { doc, updateDoc } = await import("firebase/firestore");

      const clubRef = doc(db, "clubs", clubId);
      await updateDoc(clubRef, {
        name: clubForm.name,
        description: clubForm.description,
        location: clubForm.location,
        website: clubForm.website,
        image: clubForm.image,
      });

      showAlert("success", "Club settings updated successfully!");
      setClubEditMode(false);
      loadData();
    } catch (error) {
      console.error("Error updating club:", error);
      showAlert("error", "Failed to update club settings");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setClubForm({ ...clubForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "moderator":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: "1.5rem", md: "2.125rem" },
            }}
          >
            Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your club settings, members and invitations
          </Typography>
        </Box>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert
          severity={alert.type}
          sx={{ mb: 3 }}
          onClose={() => setAlert({ show: false })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, md: 2 },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Group
                  sx={{ fontSize: { xs: 32, md: 40 }, color: "#6366f1" }}
                />
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "1.5rem", md: "2.125rem" },
                    }}
                  >
                    {members.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                  >
                    Total Members
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, md: 2 },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Email
                  sx={{ fontSize: { xs: 32, md: 40 }, color: "#10B981" }}
                />
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "1.5rem", md: "2.125rem" },
                    }}
                  >
                    {invitations.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                  >
                    Pending Invites
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label="Club Settings" icon={<Settings />} iconPosition="start" />
          <Tab label="Members" icon={<Group />} iconPosition="start" />
          <Tab label="Invitations" icon={<Email />} iconPosition="start" />
        </Tabs>

        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Club Settings Tab */}
              {activeTab === 0 && (
                <Box>
                  {!isAdmin ? (
                    <Alert severity="warning">
                      Only admins can modify club settings
                    </Alert>
                  ) : clubEditMode ? (
                    <Box>
                      <Grid container spacing={3}>
                        {/* Club Image */}
                        <Grid item xs={12} sx={{ textAlign: "center" }}>
                          <Box sx={{ mb: 2 }}>
                            <Avatar
                              src={imagePreview}
                              sx={{
                                width: { xs: 120, md: 150 },
                                height: { xs: 120, md: 150 },
                                mx: "auto",
                                mb: 2,
                              }}
                            >
                              <Business sx={{ fontSize: { xs: 60, md: 80 } }} />
                            </Avatar>
                          </Box>
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<PhotoCamera />}
                          >
                            Upload Image
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </Button>
                        </Grid>

                        {/* Club Name */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Club Name"
                            value={clubForm.name}
                            onChange={(e) =>
                              setClubForm({ ...clubForm, name: e.target.value })
                            }
                            required
                          />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Description"
                            value={clubForm.description}
                            onChange={(e) =>
                              setClubForm({
                                ...clubForm,
                                description: e.target.value,
                              })
                            }
                            multiline
                            rows={4}
                          />
                        </Grid>

                        {/* Location */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Location"
                            value={clubForm.location}
                            onChange={(e) =>
                              setClubForm({
                                ...clubForm,
                                location: e.target.value,
                              })
                            }
                          />
                        </Grid>

                        {/* Website */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Website"
                            value={clubForm.website}
                            onChange={(e) =>
                              setClubForm({
                                ...clubForm,
                                website: e.target.value,
                              })
                            }
                            placeholder="https://"
                          />
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setClubEditMode(false);
                                setClubForm({
                                  name: clubData?.name || "",
                                  description: clubData?.description || "",
                                  location: clubData?.location || "",
                                  website: clubData?.website || "",
                                  image: clubData?.image || "",
                                });
                                setImagePreview(clubData?.image || "");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleUpdateClub}
                              sx={{
                                bgcolor: "#6366f1",
                                "&:hover": { bgcolor: "#4F46E5" },
                              }}
                            >
                              Save Changes
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <Typography variant="h6">Club Information</Typography>
                        <Button
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => setClubEditMode(true)}
                          sx={{
                            bgcolor: "#6366f1",
                            "&:hover": { bgcolor: "#4F46E5" },
                          }}
                        >
                          Edit
                        </Button>
                      </Box>

                      <Grid container spacing={3}>
                        {/* Club Image */}
                        <Grid item xs={12} sx={{ textAlign: "center" }}>
                          <Avatar
                            src={clubData?.image}
                            sx={{
                              width: { xs: 120, md: 150 },
                              height: { xs: 120, md: 150 },
                              mx: "auto",
                            }}
                          >
                            <Business sx={{ fontSize: { xs: 60, md: 80 } }} />
                          </Avatar>
                        </Grid>

                        {/* Club Details */}
                        <Grid item xs={12}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Club Name
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {clubData?.name || "Not set"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Description
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {clubData?.description || "No description"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Location
                          </Typography>
                          <Typography variant="body1">
                            {clubData?.location || "Not set"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Website
                          </Typography>
                          <Typography variant="body1">
                            {clubData?.website ? (
                              <a
                                href={clubData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {clubData.website}
                              </a>
                            ) : (
                              "Not set"
                            )}
                          </Typography>
                        </Grid>

                        {/* <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Plan Type
                          </Typography>
                          <Chip
                            label={clubData?.planType || "Unknown"}
                            color={clubData?.planType === "7day-trial" ? "warning" : "success"}
                          />
                        </Grid> */}

                        <Grid item xs={12} md={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Created
                          </Typography>
                          <Typography variant="body1">
                            {clubData?.createdAt
                              ? new Date(
                                  clubData.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}

              {/* Members Tab */}
              {activeTab === 1 && (
                <>
                  {isMobile ? (
                    /* Mobile View - Card List */
                    <Box>
                      {members.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <Group
                            sx={{
                              fontSize: 64,
                              color: "text.secondary",
                              mb: 2,
                            }}
                          />
                          <Typography variant="body1" color="text.secondary">
                            No members yet. Invite your first member!
                          </Typography>
                        </Box>
                      ) : (
                        <List sx={{ p: 0 }}>
                          {members.map((member, index) => (
                            <Fragment key={member.id}>
                              {index > 0 && <Divider />}
                              <ListItem
                                sx={{
                                  px: 0,
                                  py: 2,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "stretch",
                                }}
                              >
                                <Box sx={{ width: "100%", mb: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      mb: 1,
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        {member.displayName}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: "0.875rem" }}
                                      >
                                        {member.email}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setSelectedMember(member);
                                          setEditDialogOpen(true);
                                        }}
                                        disabled={!canEditMember(member)}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleRemoveMember(member.id)
                                        }
                                        disabled={!canRemoveMember(member)}
                                        color="error"
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Chip
                                      label={member.role}
                                      size="small"
                                      color={getRoleColor(member.role)}
                                    />
                                    <Chip
                                      label={member.status || "active"}
                                      size="small"
                                      color={
                                        member.status === "active"
                                          ? "success"
                                          : "default"
                                      }
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      Joined:{" "}
                                      {member.createdAt
                                        ? new Date(
                                            member.createdAt.seconds * 1000
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </ListItem>
                            </Fragment>
                          ))}
                        </List>
                      )}
                    </Box>
                  ) : (
                    /* Desktop View - Table */
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Joined</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {members.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ py: 4 }}
                                >
                                  No members yet. Invite your first member!
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            members.map((member) => (
                              <TableRow key={member.id} hover>
                                <TableCell>{member.displayName}</TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={member.role}
                                    size="small"
                                    color={getRoleColor(member.role)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={member.status || "active"}
                                    size="small"
                                    color={
                                      member.status === "active"
                                        ? "success"
                                        : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {member.createdAt
                                    ? new Date(
                                        member.createdAt.seconds * 1000
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip
                                    title={
                                      canEditMember(member)
                                        ? "Edit Role"
                                        : "No permission"
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setSelectedMember(member);
                                          setEditDialogOpen(true);
                                        }}
                                        disabled={!canEditMember(member)}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip
                                    title={
                                      canRemoveMember(member)
                                        ? "Remove Member"
                                        : "No permission"
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleRemoveMember(member.id)
                                        }
                                        disabled={!canRemoveMember(member)}
                                        color="error"
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}

              {/* Pending Invitations Tab */}
              {activeTab === 2 && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => setInviteDialogOpen(true)}
                      fullWidth={isMobile}
                      sx={{
                        bgcolor: "#6366f1",
                        "&:hover": { bgcolor: "#4F46E5" },
                      }}
                    >
                      Invite Member
                    </Button>
                  </Box>
                  {isMobile ? (
                    /* Mobile View - Card List */
                    <Box>
                      {invitations.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <Email
                            sx={{
                              fontSize: 64,
                              color: "text.secondary",
                              mb: 2,
                            }}
                          />
                          <Typography variant="body1" color="text.secondary">
                            No pending invitations
                          </Typography>
                        </Box>
                      ) : (
                        <List sx={{ p: 0 }}>
                          {invitations.map((invitation, index) => (
                            <Fragment key={invitation.id}>
                              {index > 0 && <Divider />}
                              <ListItem
                                sx={{
                                  px: 0,
                                  py: 2,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "stretch",
                                }}
                              >
                                <Box sx={{ width: "100%", mb: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      mb: 1,
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        {invitation.displayName}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: "0.875rem" }}
                                      >
                                        {invitation.email}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleResendInvitation(invitation)}
                                        title="Resend Invitation Email"
                                      >
                                        <Send fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleCancelInvitation(invitation.id)
                                        }
                                        color="error"
                                      >
                                        <Cancel fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      flexWrap: "wrap",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Chip
                                      label={invitation.role}
                                      size="small"
                                      color={getRoleColor(invitation.role)}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Invited:{" "}
                                      {invitation.createdAt
                                        ? new Date(
                                            invitation.createdAt.seconds * 1000
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      • Expires:{" "}
                                      {invitation.expiresAt
                                        ? new Date(
                                            invitation.expiresAt.seconds * 1000
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </ListItem>
                            </Fragment>
                          ))}
                        </List>
                      )}
                    </Box>
                  ) : (
                    /* Desktop View - Table */
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Invited</TableCell>
                            <TableCell>Expires</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {invitations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ py: 4 }}
                                >
                                  No pending invitations
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            invitations.map((invitation) => (
                              <TableRow key={invitation.id} hover>
                                <TableCell>{invitation.displayName}</TableCell>
                                <TableCell>{invitation.email}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={invitation.role}
                                    size="small"
                                    color={getRoleColor(invitation.role)}
                                  />
                                </TableCell>
                                <TableCell>
                                  {invitation.createdAt
                                    ? new Date(
                                        invitation.createdAt.seconds * 1000
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  {invitation.expiresAt
                                    ? new Date(
                                        invitation.expiresAt.seconds * 1000
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title="Resend Invitation Email">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleResendInvitation(invitation)}
                                    >
                                      <Send fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancel Invitation">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleCancelInvitation(invitation.id)
                                      }
                                      color="error"
                                    >
                                      <Cancel fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => {
          setInviteDialogOpen(false);
          setInviteForm({ email: "", displayName: "", role: "member" });
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonAdd sx={{ color: "#6366f1" }} />
            Invite New Member
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              An invitation email will be sent to the member with instructions to set up their account.
            </Alert>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, email: e.target.value })
              }
              required
              helperText="Member will receive an invitation email at this address"
            />
            <TextField
              fullWidth
              label="Full Name"
              value={inviteForm.displayName}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, displayName: e.target.value })
              }
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteForm.role}
                label="Role"
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, role: e.target.value })
                }
              >
                {getAvailableRoles().map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setInviteDialogOpen(false);
              setInviteForm({ email: "", displayName: "", role: "member" });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleInviteMember}
            sx={{
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4F46E5" },
            }}
          >
            Send Invitation Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMember(null);
        }}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit Member Role</DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedMember.displayName} ({selectedMember.email})
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedMember.role}
                  label="Role"
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      role: e.target.value,
                    })
                  }
                >
                  {getEditableRoles(selectedMember).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setSelectedMember(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateRole}
            sx={{
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4F46E5" },
            }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;
