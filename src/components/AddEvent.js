import React, { useState } from "react";
import { createEvent } from "../services";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import { Close, CalendarToday, Repeat } from "@mui/icons-material";

function AddEvent({ onClose, onEventAdded, user, userProfile, selectedDate }) {
  // Format the selected date or use today
  const defaultDate = selectedDate || new Date();
  const dateString = defaultDate.toISOString().split("T")[0];

  const [eventData, setEventData] = useState({
    name: "",
    location: "",
    distance: "",
    signupLink: "",
    date: dateString,
    time: "",
    description: "",
    isRecurring: false,
    recurringPattern: "",
    recurringEndDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate user has a clubId
    if (!userProfile?.clubId) {
      setError("You must be a member of a club to create events.");
      setLoading(false);
      return;
    }

    try {
      const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);

      const newEvent = {
        name: eventData.name,
        location: eventData.location,
        distance: eventData.distance,
        signupLink: eventData.signupLink,
        description: eventData.description,
        date: eventDateTime,
        attendees: [],
        isRecurring: eventData.isRecurring,
        recurringPattern: eventData.isRecurring ? eventData.recurringPattern : null,
        recurringEndDate: eventData.isRecurring ? eventData.recurringEndDate : null,
      };

      // If it's a recurring event, create multiple instances
      if (eventData.isRecurring && eventData.recurringPattern && eventData.recurringEndDate) {
        const endDate = new Date(eventData.recurringEndDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        const eventsToCreate = [];
        let currentDate = new Date(eventDateTime);

        console.log('Creating recurring events from', currentDate, 'to', endDate);
        console.log('Pattern:', eventData.recurringPattern);

        // Generate recurring events
        while (currentDate <= endDate) {
          eventsToCreate.push({
            ...newEvent,
            date: new Date(currentDate),
          });

          // Calculate next occurrence based on pattern
          const pattern = eventData.recurringPattern;
          
          if (pattern === 'daily') {
            currentDate.setDate(currentDate.getDate() + 1);
          } else if (pattern.startsWith('weekly-')) {
            // For specific day patterns (weekly-monday, etc.)
            currentDate.setDate(currentDate.getDate() + 7);
          } else if (pattern === 'biweekly') {
            currentDate.setDate(currentDate.getDate() + 14);
          } else if (pattern === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else {
            // Unknown pattern, exit loop
            console.warn('Unknown pattern:', pattern);
            break;
          }
        }

        console.log(`Creating ${eventsToCreate.length} recurring events`);

        // Create all recurring events
        const results = await Promise.all(
          eventsToCreate.map(event => createEvent(event, user.uid, user.email, userProfile?.clubId))
        );

        const hasError = results.some(r => !r.success);
        if (hasError) {
          setError("Some events failed to create. Please try again.");
          console.error('Some events failed:', results.filter(r => !r.success));
        } else {
          console.log('All recurring events created successfully');
          onEventAdded?.();
          onClose();
        }
      } else {
        // Single event creation
        const result = await createEvent(newEvent, user.uid, user.email, userProfile?.clubId);

        if (result.success) {
          onEventAdded?.();
          onClose();
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error("Error adding event:", err);
      setError("Failed to add event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 24,
          maxWidth: 800,
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "#6366f1",
            color: "white",
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CalendarToday sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ color: "white", fontWeight: 600 }}>
              Add Running Event
            </Typography>
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

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            overflowY: "auto",
            flex: 1,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Event Information Section */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <CalendarToday sx={{ color: "#6366f1", fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#6366f1" }}
                >
                  Event Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2}>
                <Grid item size={{xs:12, md:4}}>
                  <TextField
                    fullWidth
                    required
                    label="Event Name"
                    name="name"
                    value={eventData.name}
                    onChange={handleChange}
                    placeholder="e.g., City Marathon 2025"
                  />
                </Grid>

                <Grid item size={{xs:12, md:4}}>
                  <TextField
                    fullWidth
                    required
                    label="Location"
                    name="location"
                    value={eventData.location}
                    onChange={handleChange}
                    placeholder="e.g., Central Park, NY"
                  />
                </Grid>

                <Grid item size={{xs:12, md:4}}>
                  <FormControl fullWidth required>
                    <InputLabel>Distance</InputLabel>
                    <Select
                      name="distance"
                      value={eventData.distance}
                      onChange={handleChange}
                      label="Distance"
                    >
                      <MenuItem value="">Select...</MenuItem>
                      <MenuItem value="5K">5K</MenuItem>
                      <MenuItem value="10K">10K</MenuItem>
                      <MenuItem value="15K">15K</MenuItem>
                      <MenuItem value="Half Marathon">Half Marathon</MenuItem>
                      <MenuItem value="Marathon">Marathon</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item size={{xs:12}}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    name="description"
                    value={eventData.description}
                    onChange={handleChange}
                    placeholder="Additional details about the event..."
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Date & Time Section */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <CalendarToday sx={{ color: "#10B981", fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#10B981" }}
                >
                  Date & Time
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="Date"
                    name="date"
                    value={eventData.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split("T")[0] }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="time"
                    label="Time"
                    name="time"
                    value={eventData.time}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Recurring Event Section */}
                <Grid item xs={12}>
                  <FormControlLabel
                control={
                  <Switch
                    checked={eventData.isRecurring}
                    onChange={(e) =>
                      setEventData((prev) => ({
                        ...prev,
                        isRecurring: e.target.checked,
                        recurringPattern: e.target.checked
                          ? prev.recurringPattern
                          : "",
                        recurringEndDate: e.target.checked
                          ? prev.recurringEndDate
                          : "",
                      }))
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#10B981",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#10B981",
                        },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Repeat
                      sx={{
                        fontSize: 20,
                        color: eventData.isRecurring
                          ? "#10B981"
                          : "action.disabled",
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Recurring Event
                    </Typography>
                  </Box>
                }
                  />
                </Grid>

                {eventData.isRecurring && (
                  <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Repeat Pattern</InputLabel>
                    <Select
                      name="recurringPattern"
                      value={eventData.recurringPattern}
                      onChange={handleChange}
                      label="Repeat Pattern"
                    >
                      <MenuItem value="">Select pattern...</MenuItem>
                      <MenuItem value="daily">Every Day</MenuItem>
                      <MenuItem value="weekly-monday">Every Monday</MenuItem>
                      <MenuItem value="weekly-tuesday">Every Tuesday</MenuItem>
                      <MenuItem value="weekly-wednesday">
                        Every Wednesday
                      </MenuItem>
                      <MenuItem value="weekly-thursday">
                        Every Thursday
                      </MenuItem>
                      <MenuItem value="weekly-friday">Every Friday</MenuItem>
                      <MenuItem value="weekly-saturday">
                        Every Saturday
                      </MenuItem>
                      <MenuItem value="weekly-sunday">Every Sunday</MenuItem>
                      <MenuItem value="biweekly">Every 2 Weeks</MenuItem>
                      <MenuItem value="monthly">Every Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="End Date"
                    name="recurringEndDate"
                    value={eventData.recurringEndDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: eventData.date }}
                    helperText="Last occurrence date"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                    This will create multiple event instances based on the
                    pattern until the end date.
                  </Alert>
                </Grid>
                  </>
                )}
              </Grid>
            </Box>

            {/* Additional Information Section */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <CalendarToday sx={{ color: "#F59E0B", fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#F59E0B" }}
                >
                  Additional Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="url"
                    label="Registration Link (Optional)"
                    name="signupLink"
                    value={eventData.signupLink}
                    onChange={handleChange}
                    placeholder="https://example.com/register"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 3,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              disabled={loading}
              sx={{
                color: "#6B7280",
                borderColor: "#D1D5DB",
                "&:hover": {
                  borderColor: "#9CA3AF",
                  bgcolor: "#F9FAFB",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: "#6366f1",
                "&:hover": {
                  bgcolor: "#4F46E5",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Create Event"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default AddEvent;
