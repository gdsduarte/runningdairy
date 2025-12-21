import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  useTheme,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { DirectionsRun, Google } from "@mui/icons-material";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPassword,
} from "../services";
import { responsiveSpacing } from "../utils/responsive";

function Auth({ onClose }) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0); // 0: Sign In, 1: Sign Up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === 1) {
        // Sign Up
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const result = await signUpWithEmail(email, password);
        if (result.success) {
          if (onClose) onClose();
        } else {
          setError(result.error);
        }
      } else {
        // Sign In
        const result = await signInWithEmail(email, password);
        if (result.success) {
          if (onClose) onClose();
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        if (onClose) onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setResetEmailSent(true);
        setError("");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 400,
          p: responsiveSpacing.pageContainer,
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: responsiveSpacing.sectionGap,
          }}
        >
          <DirectionsRun sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h2" component="h2">
            {activeTab === 0 ? "Welcome Back!" : "Join RunDiary"}
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setError("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
          }}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>

        <Box
          component="form"
          onSubmit={handleEmailAuth}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            placeholder="your@email.com"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            placeholder="••••••••"
            inputProps={{ minLength: 6 }}
          />

          {activeTab === 0 && (
            <Box sx={{ textAlign: "right" }}>
              <Button
                onClick={() => setShowForgotPassword(true)}
                sx={{ 
                  textTransform: "none", 
                  fontSize: "0.875rem",
                  p: 0,
                  minWidth: "auto"
                }}
              >
                Forgot password?
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              placeholder="••••••••"
              inputProps={{ minLength: 6 }}
            />
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? "Loading..." : activeTab === 0 ? "Sign In" : "Sign Up"}
          </Button>
        </Box>

        <Divider sx={{ my: responsiveSpacing.sectionGap }}>OR</Divider>

        <Button
          onClick={handleGoogleAuth}
          variant="outlined"
          fullWidth
          disabled={loading}
          startIcon={<Google />}
          sx={{
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            "&:hover": {
              borderColor: theme.palette.primary.main,
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          Continue with Google
        </Button>

        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: responsiveSpacing.sectionGap }}>
          {activeTab === 0 
            ? "Sign up to browse and join running clubs" 
            : "After signing up, you can search for clubs to join"}
        </Typography>
      </Paper>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1400,
            p: 2,
          }}
          onClick={() => {
            setShowForgotPassword(false);
            setResetEmailSent(false);
            setError("");
          }}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: "100%",
              maxWidth: 400,
              p: 3,
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Reset Password
            </Typography>

            {resetEmailSent ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Password reset email sent! Check your inbox.
                </Alert>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                  }}
                >
                  Close
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>

                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  placeholder="your@email.com"
                  sx={{ mb: 2 }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* {{showRegisterClub && (
        <RegisterClub
          open={showRegisterClub}
          onClose={() => setShowRegisterClub(false)}
          onSuccess={() => {
            setShowRegisterClub(false);
            // User will be automatically logged in after registration
          }}
        />
      )} */}
    </Box>
  );
}

export default Auth;
