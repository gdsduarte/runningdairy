import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  IconButton,
  Paper,
  useTheme,
} from "@mui/material";
import { Close, DirectionsRun, Google } from "@mui/icons-material";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from "../services";
import { responsiveSpacing } from "../utils/responsive";

function Auth({ onClose }) {
  const theme = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signInWithEmail(email, password);
      } else {
        result = await signUpWithEmail(email, password);
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error);
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
        onClose();
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
        {onClose && (
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <Close />
          </IconButton>
        )}

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
            {isLogin ? "Welcome Back!" : "Join the Run"}
          </Typography>
        </Box>

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
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </Box>

        <Divider sx={{ my: responsiveSpacing.sectionGap }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Button
          onClick={handleGoogleAuth}
          variant="outlined"
          fullWidth
          disabled={loading}
          startIcon={<Google />}
          sx={{
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          Continue with Google
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: responsiveSpacing.sectionGap }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            sx={{
              textTransform: "none",
              p: 0,
              minWidth: "auto",
              fontWeight: 600,
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Auth;
