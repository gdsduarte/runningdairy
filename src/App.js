import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { useAuthListener } from "./store/hooks/useAuthListener";
import { useEventsListener } from "./store/hooks/useEventsListener";
import { signOut, getUserRole } from "./services";
import theme from "./theme/theme";
import MainLayout from "./components/MainLayout";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import EventCalendar from "./components/EventCalendar";
import Profile from "./components/Profile";
import AddEvent from "./components/AddEvent";
import EditEvent from "./components/EditEvent";
import EventDetails from "./components/EventDetails";
import AdminPanel from "./components/AdminPanel";
import SetupAccount from "./components/SetupAccount";

function App() {
  // Initialize Redux listeners
  useAuthListener();
  useEventsListener();

  // Get auth state from Redux
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const userProfile = useSelector((state) => state.user.profile);

  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load user role
  useEffect(() => {
    const loadUserRole = async () => {
      if (user) {
        const result = await getUserRole(user.uid);
        if (result.success) {
          setUserRole(result);
        }
      }
      setRoleLoading(false);
    };

    loadUserRole();
  }, [user]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(null);
    setEditingEvent(event);
  };

  const handleAddEvent = (date) => {
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) {
        alert("Cannot add events to past dates");
        return;
      }
    }

    setSelectedDate(date);
    setShowAddEvent(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || roleLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Box>Loading...</Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/setup-account" element={<SetupAccount />} />
            <Route path="*" element={<Auth onClose={null} />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <MainLayout onLogout={handleLogout} userRole={userRole}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  user={user}
                  userProfile={userProfile}
                  onEventClick={handleEventClick}
                  onAddEvent={handleAddEvent}
                />
              }
            />
            <Route
              path="/calendar"
              element={
                <EventCalendar
                  onEventClick={handleEventClick}
                  user={user}
                  onAddEvent={handleAddEvent}
                />
              }
            />
            <Route path="/profile" element={<Profile user={user} />} />
            
            {/* Admin Routes */}
            {(userRole?.role === 'admin' || userRole?.role === 'moderator') && (
              <Route
                path="/admin/members"
                element={
                  <AdminPanel user={user} clubId={userRole?.clubId} userRole={userRole?.role} />
                }
              />
            )}
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>

        {/* Modals */}
        {showAddEvent && (
          <AddEvent
            user={user}
            userProfile={userProfile}
            selectedDate={selectedDate}
            onClose={() => {
              setShowAddEvent(false);
              setSelectedDate(null);
            }}
            onEventAdded={() => {
              // Event will be automatically updated via Firestore listener
            }}
          />
        )}

        {editingEvent && (
          <EditEvent
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onEventUpdated={() => {
              setEditingEvent(null);
              // Event will be automatically updated via Firestore listener
            }}
          />
        )}

        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            user={user}
            onEditEvent={handleEditEvent}
          />
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
