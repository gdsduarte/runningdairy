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
  useTheme,
} from "@mui/material";
import { Close, CalendarToday } from "@mui/icons-material";
import { responsiveSpacing, componentStyles } from "../utils/responsive";

function AddEvent({ onClose, onEventAdded, user, selectedDate }) {
  const theme = useTheme();

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
      };

      const result = await createEvent(newEvent, user.uid, user.email);

      if (result.success) {
        onEventAdded?.();
        onClose();
      } else {
        setError(result.error);
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
      }}
    >
      <Box
        sx={{
          ...componentStyles.responsiveModal,
          position: "relative",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: theme.palette.primary.main,
            color: "white",
            p: responsiveSpacing.pageContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarToday />
            <Typography variant="h2" sx={{ color: "white" }}>
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
          sx={{ p: responsiveSpacing.pageContainer }}
        >
          <Grid container spacing={responsiveSpacing.gridSpacing}>
            <Grid item xs={12}>
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

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Distance</InputLabel>
                <Select
                  name="distance"
                  value={eventData.distance}
                  onChange={handleChange}
                  label="Distance"
                >
                  <MenuItem value="">Select distance...</MenuItem>
                  <MenuItem value="5K">5K</MenuItem>
                  <MenuItem value="10K">10K</MenuItem>
                  <MenuItem value="15K">15K</MenuItem>
                  <MenuItem value="Half Marathon">Half Marathon (21K)</MenuItem>
                  <MenuItem value="Marathon">Marathon (42K)</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="url"
                label="Registration Link"
                name="signupLink"
                value={eventData.signupLink}
                onChange={handleChange}
                placeholder="https://example.com/register"
              />
            </Grid>

            <Grid item xs={12}>
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

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Add Event"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default AddEvent;
