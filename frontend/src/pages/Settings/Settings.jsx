"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material"
import { Notifications, Palette, Security, Settings as SettingsIcon, AccountCircle, Save } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import api from "../../services/api"
import "./Settings.css"

const Settings = () => {
  const { user, updateUser } = useAuth()
  const { showSnackbar } = useNotification()

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      ticketUpdates: true,
      commentReplies: true,
      statusChanges: true,
    },
    appearance: {
      theme: "light",
      language: "en",
      timezone: "UTC",
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      allowMessages: true,
    },
    system: {
      autoAssign: false,
      defaultPriority: "medium",
      ticketsPerPage: 10,
    },
  })

  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const fetchUserSettings = async () => {
    try {
      const response = await api.get("/users/settings")
      if (response.data.settings) {
        setSettings(response.data.settings)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const handleSettingChange = (category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      await api.put("/users/settings", { settings })
      showSnackbar("Settings saved successfully!", "success")
      setHasChanges(false)
    } catch (error) {
      showSnackbar("Failed to save settings", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "primary.main" }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customize your QuickDesk experience
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={!hasChanges || loading}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            background: hasChanges ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : undefined,
            "&:hover": {
              background: hasChanges ? "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)" : undefined,
            },
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, height: "fit-content" }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Notifications color="primary" />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Notification Preferences
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange("notifications", "email", e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Receive email updates for ticket activities
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange("notifications", "push", e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Get browser notifications for important updates
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Notification Types
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.ticketUpdates}
                      onChange={(e) => handleSettingChange("notifications", "ticketUpdates", e.target.checked)}
                    />
                  }
                  label="Ticket Updates"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.commentReplies}
                      onChange={(e) => handleSettingChange("notifications", "commentReplies", e.target.checked)}
                    />
                  }
                  label="Comment Replies"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.statusChanges}
                      onChange={(e) => handleSettingChange("notifications", "statusChanges", e.target.checked)}
                    />
                  }
                  label="Status Changes"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, height: "fit-content" }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Palette color="primary" />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Appearance
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={3}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.appearance.theme}
                    label="Theme"
                    onChange={(e) => handleSettingChange("appearance", "theme", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.appearance.language}
                    label="Language"
                    onChange={(e) => handleSettingChange("appearance", "language", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.appearance.timezone}
                    label="Timezone"
                    onChange={(e) => handleSettingChange("appearance", "timezone", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, height: "fit-content" }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Security color="primary" />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Privacy & Security
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.profileVisible}
                      onChange={(e) => handleSettingChange("privacy", "profileVisible", e.target.checked)}
                    />
                  }
                  label="Profile Visible to Others"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Allow other users to see your profile information
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showEmail}
                      onChange={(e) => handleSettingChange("privacy", "showEmail", e.target.checked)}
                    />
                  }
                  label="Show Email Address"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Display your email address in your profile
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.allowMessages}
                      onChange={(e) => handleSettingChange("privacy", "allowMessages", e.target.checked)}
                    />
                  }
                  label="Allow Direct Messages"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Let other users send you direct messages
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, height: "fit-content" }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  System Preferences
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={3}>
                {user?.role !== "user" && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.system.autoAssign}
                        onChange={(e) => handleSettingChange("system", "autoAssign", e.target.checked)}
                      />
                    }
                    label="Auto-assign Tickets"
                  />
                )}

                <FormControl fullWidth>
                  <InputLabel>Default Priority</InputLabel>
                  <Select
                    value={settings.system.defaultPriority}
                    label="Default Priority"
                    onChange={(e) => handleSettingChange("system", "defaultPriority", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Tickets Per Page</InputLabel>
                  <Select
                    value={settings.system.ticketsPerPage}
                    label="Tickets Per Page"
                    onChange={(e) => handleSettingChange("system", "ticketsPerPage", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <AccountCircle color="primary" />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Account Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={user?.name || ""}
                    disabled
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={user?.email || ""}
                    disabled
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ""}
                    disabled
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Member Since"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                    disabled
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                To update your account information, please contact your system administrator.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default Settings
