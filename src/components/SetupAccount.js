/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material";
import { Lock, CheckCircle } from "@mui/icons-material";
import { verifyInvitation, completeMemberSetup } from "../services";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function SetupAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Pre-fill email from invitation when loaded
  useEffect(() => {
    if (invitation?.email) {
      setFormData(prev => ({ ...prev, email: invitation.email }));
    }
  }, [invitation]);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setError("Invalid invitation link");
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    setLoading(true);
    const result = await verifyInvitation(token);

    if (result.success) {
      setInvitation(result.invitation);
      setError("");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        invitation.email,
        formData.password
      );

      // Complete member setup in Firestore with email verification
      const setupResult = await completeMemberSetup(
        token,
        userCredential.user.uid,
        userCredential.user.email,
        formData.password
      );

      if (setupResult.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(setupResult.error);
      }
    } catch (error) {
      console.error("Error setting up account:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invitation) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F3F4F6",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !invitation) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F3F4F6",
        }}
      >
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate("/")}
                sx={{
                  bgcolor: "#6366f1",
                  "&:hover": { bgcolor: "#4F46E5" },
                }}
              >
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F3F4F6",
        }}
      >
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <CheckCircle sx={{ fontSize: 80, color: "#10B981", mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Account Setup Complete!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your account has been created successfully. Redirecting to dashboard...
              </Typography>
              <CircularProgress />
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F3F4F6",
      }}
    >
      <Container maxWidth="sm">
        <Card>
          <Box
            sx={{
              bgcolor: "#6366f1",
              color: "white",
              p: 3,
              textAlign: "center",
            }}
          >
            <Lock sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Set Up Your Account
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Welcome to the team! Create your password to get started.
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {invitation && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Email Verification Required
                  </Typography>
                  <Typography variant="body2">
                    Your account will be created with: <strong>{invitation.email}</strong>
                  </Typography>
                </Alert>
                {/* <Box sx={{ p: 2, bgcolor: "#EEF2FF", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {invitation.displayName}, you've been invited to join as: {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {invitation.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Role: {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                  </Typography>
                </Box> */}
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  helperText="Must be at least 6 characters"
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                {error && (
                  <Alert severity="error" onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    bgcolor: "#6366f1",
                    "&:hover": { bgcolor: "#4F46E5" },
                    py: 1.5,
                    mt: 1,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Create Account"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 3 }}
        >
          Having trouble? Contact your club administrator
        </Typography>
      </Container>
    </Box>
  );
}

export default SetupAccount;
