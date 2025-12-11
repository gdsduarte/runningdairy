import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  useTheme,
} from "@mui/material";
import { DirectionsRun } from "@mui/icons-material";
import {
  signInWithEmail,
} from "../services";
import { responsiveSpacing } from "../utils/responsive";
// import RegisterClub from "./RegisterClub";

function Auth({ onClose }) {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const [showRegisterClub, setShowRegisterClub] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmail(email, password);

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
            Welcome Back!
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
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </Box>

        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: responsiveSpacing.sectionGap }}>
          Members are invited by club administrators
        </Typography>

        {/* <Divider sx={{ my: responsiveSpacing.sectionGap }} />

        <Button
          onClick={() => setShowRegisterClub(true)}
          variant="text"
          fullWidth
          sx={{
            color: theme.palette.primary.main,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          Register Your Running Club
        </Button> */}
      </Paper>

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
