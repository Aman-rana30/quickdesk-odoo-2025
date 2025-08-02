"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import {
  Notifications,
  Security,
  Palette,
  Language,
  Save,
  RestartAlt,
  Warning,
  Info,
  CheckCircle,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import "./Settings.css"

const Settings = () => {
  const { user, updateProfile } = useAuth()
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
      compactMode: false,
      showAvatars: true,
    },
    privacy: {
      profileVisibility: "public",
      activityTracking: true,
    },
    language: "en",
    timezone: "UTC",
  })

  const [loading, setLoading] = useState(false)
  const [resetDialog, setResetDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (user?.notifications) {
      setSettings((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          email: user.notifications.email,
          push: user.notifications.push,
        },
      }))
    }
  }, [user])

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)

      // Update profile with notification settings
      const result = await updateProfile({
        notifications: {
          email: settings.notifications.email,
          push: settings.notifications.push,
        },
      })

      if (result.success) {
        setHasChanges(false)
        showSnackbar("Settings saved successfully!", "success")
      } else {
        showSnackbar(result.message || "Failed to save settings", "error")
      }
    } catch (error) {
      showSnackbar("Failed to save settings", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      notifications: {
        email: true,
        push: true,
        ticketUpdates: true,
        commentReplies: true,
        statusChanges: true,
      },
      appearance: {
        theme: "light",
        compactMode: false,
        showAvatars: true,
      },
      privacy: {
        profileVisibility: "public",
        activityTracking: true,
      },
      language: "en",
      timezone: "UTC",
    })
    setHasChanges(true)
    setResetDialog(false)
    showSnackbar("Settings reset to defaults", "info")
  }

  return (
    <div className="settings-container">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your QuickDesk experience
        </Typography>
      </Box>

      {hasChanges && (
        <Alert
          severity="info"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleSaveSettings} disabled={loading}>
              {loading ? <CircularProgress size={16} /> : "Save Changes"}
            </Button>
          }
        >
          You have unsaved changes
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Notifications sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Notification Preferences
                </Typography>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange("notifications", "email", e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Email Notifications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive email updates for important events
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, alignItems: "flex-start" }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange("notifications", "push", e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Browser Notifications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Show desktop notifications for real-time updates
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, alignItems: "flex-start" }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.ticketUpdates}
                      onChange={(e) => handleSettingChange("notifications", "ticketUpdates", e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Ticket Updates
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Get notified when tickets are updated
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, alignItems: "flex-start" }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.commentReplies}
                      onChange={(e) => handleSettingChange("notifications", "commentReplies", e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Comment Replies
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Notify when someone replies to your comments
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, alignItems: "flex-start" }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.statusChanges}
                      onChange={(e) => handleSettingChange("notifications", "statusChanges", e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Status Changes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Get notified when ticket status changes
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Palette sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Appearance
                </Typography>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleSettingChange("appearance", "compactMode", e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Compact Mode
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reduce spacing for more content on screen
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, alignItems: "flex-start" }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.showAvatars}
                      onChange={(e) => handleSettingChange("appearance", "showAvatars", e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Show Avatars
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Display user avatars in comments and lists
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Security sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Privacy & Security
                </Typography>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.activityTracking}
                      onChange={(e) => handleSettingChange("privacy", "activityTracking", e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Activity Tracking
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Allow tracking of your activity for analytics
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Language sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  System Preferences
                </Typography>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  select
                  label="Language"
                  value={settings.language}
                  onChange={(e) => handleSettingChange("", "language", e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ mb: 2 }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </TextField>

                <TextField
                  fullWidth
                  select
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange("", "timezone", e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </TextField>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Account Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                    <CheckCircle sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Account Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                    <Info sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Member Since
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                    <Security sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Security Level
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Standard
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button
          variant="outlined"
          startIcon={<RestartAlt />}
          onClick={() => setResetDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Reset to Defaults
        </Button>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          onClick={handleSaveSettings}
          disabled={!hasChanges || loading}
          sx={{
            borderRadius: 2,
            px: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            },
          }}
        >
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </Box>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Warning sx={{ mr: 2, color: "warning.main" }} />
            <Typography>
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetSettings} color="warning" variant="contained">
            Reset Settings
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Settings