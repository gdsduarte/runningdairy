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
  Typography,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { componentStyles } from "../utils/responsive";
import {
  DirectionsRun,
  CalendarToday,
  Person,
  Menu,
  ChevronLeft,
  Logout,
  Group,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const getMenuItems = (userRole, isMobile = false) => {
  const baseItems = [
    { path: "/dashboard", label: "Dashboard", icon: <DirectionsRun /> },
    { path: "/calendar", label: "Calendar", icon: <CalendarToday /> },
    { path: "/profile", label: "Profile", icon: <Person /> },
  ];

  const adminItems =
    userRole?.role === "admin" || userRole?.role === "moderator"
      ? [{ path: "/admin/members", label: "Members", icon: <Group /> }]
      : [];

  // Don't include logout in mobile bottom nav (it's in top bar)
  const logoutItem = isMobile ? [] : [{ path: "/logout", label: "Logout", icon: <Logout /> }];

  return [
    ...baseItems,
    ...adminItems,
    ...logoutItem,
  ];
};

function MainLayout({ children, onLogout, userRole }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const menuItems = getMenuItems(userRole, isMobile);
  const drawerWidth = sidebarExpanded ? 240 : 60;

  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Top App Bar */}
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            //boxShadow: 1,
            //zIndex: 1200,
          }}
        >
          <Toolbar>
            <DirectionsRun sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                color: theme.palette.primary.main,
              }}
            >
              RunDiary
            </Typography>
            <IconButton
              onClick={() => setShowLogoutDialog(true)}
              sx={{ color: "text.secondary" }}
            >
              <Logout />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ flex: 1, overflow: "auto", pt: 7, pb: 7 }}>{children}</Box>

        {/* Bottom Navigation */}
        <Box
          sx={{
            ...componentStyles.mobileBottomNav,
          }}
        >
          {menuItems.map((item) => (
            <IconButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                color:
                  location.pathname === item.path
                    ? theme.palette.primary.main
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

        {/* Logout Confirmation Dialog */}
        <Dialog open={showLogoutDialog} onClose={() => setShowLogoutDialog(false)}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to logout?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setShowLogoutDialog(false);
                onLogout?.();
              }}
              variant="contained"
              color="primary"
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>
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
              <DirectionsRun sx={{ color: theme.palette.primary.main }} />
              <Box
                component="span"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
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
                onClick={() => {
                  if (item.path === "/logout") {
                    setShowLogoutDialog(true);
                  } else {
                    navigate(item.path);
                  }
                }}
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
                        ? theme.palette.primary.main
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

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onClose={() => setShowLogoutDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowLogoutDialog(false);
              onLogout?.();
            }}
            variant="contained"
            color="primary"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MainLayout;
