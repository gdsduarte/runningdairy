import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // Responsive breakpoints (default: xs=0, sm=600, md=900, lg=1200, xl=1536)
  breakpoints: {
    values: {
      xs: 0,      // Mobile
      sm: 600,    // Tablet
      md: 900,    // Small laptop
      lg: 1200,   // Desktop
      xl: 1536,   // Large desktop
    },
  },
  palette: {
    primary: {
      main: "#0066ff",
      light: "#4d94ff",
      dark: "#0052cc",
    },
    secondary: {
      main: "#FF6B35",
      light: "#FF8C61",
      dark: "#F7931E",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#2c3e50",
      secondary: "#666666",
    },
  },
  // Responsive typography
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "1.75rem",  // Mobile
      fontWeight: 700,
      "@media (min-width:600px)": {
        fontSize: "2rem",     // Tablet
      },
      "@media (min-width:900px)": {
        fontSize: "2.5rem",   // Desktop
      },
    },
    h2: {
      fontSize: "1.25rem",  // Mobile
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "1.5rem",   // Tablet
      },
      "@media (min-width:900px)": {
        fontSize: "1.75rem",  // Desktop
      },
    },
    h3: {
      fontSize: "1.1rem",   // Mobile
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "1.25rem",  // Tablet+
      },
    },
    body1: {
      fontSize: "0.95rem",  // Mobile
      "@media (min-width:600px)": {
        fontSize: "1rem",     // Tablet+
      },
    },
    body2: {
      fontSize: "0.875rem", // Mobile
      "@media (min-width:600px)": {
        fontSize: "0.9rem",   // Tablet+
      },
    },
  },
  // Responsive spacing
  spacing: 8, // 1 unit = 8px
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 16px",
          "@media (max-width:600px)": {
            padding: "6px 12px",
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#0066ff",
            },
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "16px",
          paddingRight: "16px",
          "@media (min-width:600px)": {
            paddingLeft: "24px",
            paddingRight: "24px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            borderRadius: "4px",
          },
        },
      },
    },
  },
});

export default theme;
