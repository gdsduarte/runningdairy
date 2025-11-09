import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DirectionsRun,
  CalendarToday,
  Person,
  Menu,
  ChevronLeft,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: <DirectionsRun /> },
  { path: "/calendar", label: "Calendar", icon: <CalendarToday /> },
  { path: "/profile", label: "Profile", icon: <Person /> },
];

function MainLayout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const drawerWidth = sidebarExpanded ? 240 : 60;

  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Main Content */}
        <Box sx={{ flex: 1, overflow: "auto", pb: 7 }}>{children}</Box>

        {/* Bottom Navigation */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-around",
            py: 1,
            zIndex: 1100,
          }}
        >
          {menuItems.map((item) => (
            <IconButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                color:
                  location.pathname === item.path
                    ? "primary.main"
                    : "text.secondary",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              {item.icon}
              <Box component="span" sx={{ fontSize: "0.75rem" }}>
                {item.label}
              </Box>
            </IconButton>
          ))}
        </Box>
      </Box>
    );
  }

  // Desktop Layout with Sidebar
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            transition: "width 0.3s",
            overflowX: "hidden",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          {sidebarExpanded && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DirectionsRun color="primary" />
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                RunDiary
              </Box>
            </Box>
          )}
          <IconButton
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            size="small"
          >
            {sidebarExpanded ? <ChevronLeft /> : <Menu />}
          </IconButton>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarExpanded ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarExpanded ? 3 : "auto",
                    justifyContent: "center",
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {sidebarExpanded && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;
