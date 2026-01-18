import { useState } from "react";
import { updateEvent } from "../services";
import {
  Box,
  Dialog,
  DialogContent,
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
  useMediaQuery,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Close,
  Edit,
  CalendarToday,
  Schedule,
  Repeat,
} from "@mui/icons-material";

function EditEvent({ event, onClose, onEventUpdated }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const eventDate =
    event.date instanceof Date ? event.date : new Date(event.date);

  const [eventData, setEventData] = useState({
    name: event.name || "",
    location: event.location || "",
    distance: event.distance || "",
    signupLink: event.signupLink || "",
    date: eventDate.toISOString().split("T")[0],
    time: eventDate.toTimeString().slice(0, 5),
    description: event.description || "",
    isRecurring: event.isRecurring || false,
    recurringPattern: event.recurringPattern || "",
    recurringEndDate: event.recurringEndDate || "",
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

      const updatedEvent = {
        name: eventData.name,
        location: eventData.location,
        distance: eventData.distance,
        isRecurring: eventData.isRecurring,
        recurringPattern: eventData.isRecurring
          ? eventData.recurringPattern
          : "",
        recurringEndDate: eventData.isRecurring
          ? eventData.recurringEndDate
          : "",
        signupLink: eventData.signupLink,
        description: eventData.description,
        date: eventDateTime,
      };

      const result = await updateEvent(event.id, updatedEvent);

      if (result.success) {
        onEventUpdated?.();
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 1,
          maxHeight: isMobile ? "100%" : "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          p: isMobile ? 2 : 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Edit sx={{ fontSize: 28 }} />
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
            Edit Event
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Scrollable Form Content */}
      <DialogContent
        sx={{
          p: isMobile ? 2 : 3,
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Box component="form" id="edit-event-form" onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Event Information Section */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <CalendarToday
                  sx={{ color: theme.palette.primary.main, fontSize: 20 }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  Event Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2}>
                <Grid item size={{ xs: 12, md: 4 }}>
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

                <Grid item size={{ xs: 12, md: 4 }}>
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

                <Grid item size={{ xs: 12, md: 4 }}>
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
                      <MenuItem value="Half Marathon">
                        Half Marathon (21K)
                      </MenuItem>
                      <MenuItem value="Marathon">Marathon (42K)</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item size={{ xs: 12 }}>
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
                <Schedule sx={{ color: "#10B981", fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#10B981" }}
                >
                  Date & Time
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2}>
                <Grid item size={{ xs: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="Date"
                    name="date"
                    value={eventData.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item size={{ xs: 6, md: 4 }}>
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
                <Grid item size={{ xs: 12, md: 4 }}>
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                    <Grid item size={{ xs: 6, md: 4 }}>
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
                          <MenuItem value="weekly-monday">
                            Every Monday
                          </MenuItem>
                          <MenuItem value="weekly-tuesday">
                            Every Tuesday
                          </MenuItem>
                          <MenuItem value="weekly-wednesday">
                            Every Wednesday
                          </MenuItem>
                          <MenuItem value="weekly-thursday">
                            Every Thursday
                          </MenuItem>
                          <MenuItem value="weekly-friday">
                            Every Friday
                          </MenuItem>
                          <MenuItem value="weekly-saturday">
                            Every Saturday
                          </MenuItem>
                          <MenuItem value="weekly-sunday">
                            Every Sunday
                          </MenuItem>
                          <MenuItem value="biweekly">Every 2 Weeks</MenuItem>
                          <MenuItem value="monthly">Every Month</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item size={{ xs: 6, md: 4 }}>
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

                    <Grid item size={12}>
                      <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                        Changes to recurring events will only apply to this
                        specific occurrence.
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
                <Grid item size={12}>
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
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      {/* Fixed Bottom Actions */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: "divider",
          p: 2,
          bgcolor: "background.paper",
          display: "flex",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 1,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-event-form"
          variant="contained"
          fullWidth
          disabled={
            loading ||
            !eventData.name ||
            !eventData.location ||
            !eventData.distance ||
            !eventData.date ||
            !eventData.time ||
            (eventData.isRecurring &&
              (!eventData.recurringPattern || !eventData.recurringEndDate))
          }
          sx={{
            borderRadius: 1,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Update Event"
          )}
        </Button>
      </Box>
    </Dialog>
  );
}

export default EditEvent;
