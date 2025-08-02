"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Paper,
} from "@mui/material";
import {
  Person,
  Email,
  Notifications,
  Security,
  Save,
  Edit,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import "./Profile.css";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showSnackbar } = useNotification();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    notifications: {
      email: true,
      push: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        notifications: user.notifications || {
          email: true,
          push: true,
        },
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showSnackbar("Please fix the errors before saving", "error");
      return;
    }

    try {
      setLoading(true);
      const result = await updateProfile({
        name: profileData.name,
        notifications: profileData.notifications,
      });

      if (result.success) {
        setEditMode(false);
        showSnackbar("Profile updated successfully!", "success");
      } else {
        showSnackbar(result.message || "Failed to update profile", "error");
      }
    } catch (error) {
      showSnackbar("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        notifications: user.notifications || {
          email: true,
          push: true,
        },
      });
    }
    setEditMode(false);
    setErrors({});
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "agent":
        return "warning";
      case "user":
        return "primary";
      default:
        return "default";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="profile-container">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Personal Information
                </Typography>
                <Button
                  variant={editMode ? "outlined" : "contained"}
                  startIcon={editMode ? null : <Edit />}
                  onClick={() => setEditMode(!editMode)}
                  sx={{ borderRadius: 2 }}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!editMode}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <Person sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
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
                    value={profileData.email}
                    disabled={true}
                    InputProps={{
                      startAdornment: (
                        <Email sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                    helperText="Email cannot be changed"
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <Save />
                    }
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      },
                    }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Notifications sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Notification Preferences
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.notifications.email}
                        onChange={(e) =>
                          handleInputChange(
                            "notifications.email",
                            e.target.checked
                          )
                        }
                        disabled={!editMode}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          Email Notifications
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Receive email updates when tickets are created or
                          updated
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.notifications.push}
                        onChange={(e) =>
                          handleInputChange(
                            "notifications.push",
                            e.target.checked
                          )
                        }
                        disabled={!editMode}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          Push Notifications
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Receive browser notifications for real-time updates
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Summary */}
        <Grid item xs={12} lg={4}>
          {/* User Card */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "primary.main",
                  fontSize: "2rem",
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Chip
                label={user?.role?.toUpperCase()}
                color={getRoleColor(user?.role)}
                sx={{ mt: 1, fontWeight: "bold" }}
              />
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Security sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Account Information
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Account Status
                </Typography>
                <Chip
                  label={user?.isActive ? "Active" : "Inactive"}
                  color={user?.isActive ? "success" : "error"}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {user?.lastLogin ? formatDate(user.lastLogin) : "N/A"}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "info.light",
              color: "info.contrastText",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              🔒 Security Tips
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Keep your account information up to date
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Use a strong, unique password
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Enable notifications to stay informed
              </Typography>
              <Typography component="li" variant="body2">
                Log out from shared devices
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Profile;
