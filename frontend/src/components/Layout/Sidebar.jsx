"use client"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
} from "@mui/material"
import { Dashboard, ConfirmationNumber, Add, Person, People, Category } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/dashboard",
      roles: ["user", "agent", "admin"],
    },
    {
      text: "My Tickets",
      icon: <ConfirmationNumber />,
      path: "/tickets",
      roles: ["user", "agent", "admin"],
    },
    {
      text: "Create Ticket",
      icon: <Add />,
      path: "/tickets/new",
      roles: ["user", "agent", "admin"],
    },
    {
      text: "Profile",
      icon: <Person />,
      path: "/profile",
      roles: ["user", "agent", "admin"],
    },
  ]

  const adminItems = [
    {
      text: "User Management",
      icon: <People />,
      path: "/admin/users",
      roles: ["admin"],
    },
    {
      text: "Categories",
      icon: <Category />,
      path: "/admin/categories",
      roles: ["admin"],
    },
  ]

  const handleNavigation = (path) => {
    navigate(path)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const canAccess = (roles) => {
    return roles.includes(user?.role)
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold", color: "primary.main" }}>
          QuickDesk
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Help Desk System
        </Typography>
        {user && (
          <Box sx={{ mt: 2 }}>
            <Chip label={user.role.toUpperCase()} size="small" color="primary" variant="outlined" />
          </Box>
        )}
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map(
          (item) =>
            canAccess(item.roles) && (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive(item.path) ? "primary.main" : "transparent",
                    color: isActive(item.path) ? "white" : "text.primary",
                    "&:hover": {
                      backgroundColor: isActive(item.path) ? "primary.dark" : "action.hover",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? "white" : "text.secondary",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ),
        )}

        {user?.role === "admin" && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" sx={{ px: 2, color: "text.secondary", fontWeight: 600 }}>
              Administration
            </Typography>
            {adminItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive(item.path) ? "primary.main" : "transparent",
                    color: isActive(item.path) ? "white" : "text.primary",
                    "&:hover": {
                      backgroundColor: isActive(item.path) ? "primary.dark" : "action.hover",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? "white" : "text.secondary",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>

      <Divider />

      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          © 2024 QuickDesk
        </Typography>
      </Box>
    </Box>
  )
}

export default Sidebar
