"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel,
  Switch,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { Add, Edit, Delete, MoreVert, Category, Save, Cancel, Visibility, VisibilityOff } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import api from "../../services/api"
import "./CategoryManagement.css"

const CategoryManagement = () => {
  const { user } = useAuth()
  const { showSnackbar } = useNotification()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#1976d2",
    icon: "category",
    isActive: true,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const predefinedColors = [
    "#1976d2", // Blue
    "#388e3c", // Green
    "#f57c00", // Orange
    "#d32f2f", // Red
    "#7b1fa2", // Purple
    "#0288d1", // Light Blue
    "#689f38", // Light Green
    "#fbc02d", // Yellow
    "#e64a19", // Deep Orange
    "#512da8", // Deep Purple
    "#00796b", // Teal
    "#455a64", // Blue Grey
  ]

  const iconOptions = [
    "category",
    "bug_report",
    "help",
    "settings",
    "computer",
    "phone",
    "email",
    "security",
    "account_circle",
    "business",
    "home",
    "work",
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get("/categories")
      setCategories(response.data.categories)
    } catch (error) {
      showSnackbar("Failed to fetch categories", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required"
    }

    if (!formData.color) {
      newErrors.color = "Color is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar("Please fix the errors before saving", "error")
      return
    }

    try {
      setSubmitting(true)

      if (editMode) {
        await api.put(`/categories/${selectedCategory._id}`, formData)
        showSnackbar("Category updated successfully", "success")
      } else {
        await api.post("/categories", formData)
        showSnackbar("Category created successfully", "success")
      }

      handleCloseDialog()
      fetchCategories()
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Failed to save category", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
    })
    setEditMode(true)
    setDialogOpen(true)
    handleMenuClose()
  }

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${categoryId}`)
        showSnackbar("Category deleted successfully", "success")
        fetchCategories()
      } catch (error) {
        showSnackbar("Failed to delete category", "error")
      }
    }
    handleMenuClose()
  }

  const handleToggleStatus = async (categoryId, currentStatus) => {
    try {
      await api.put(`/categories/${categoryId}`, {
        isActive: !currentStatus,
      })
      showSnackbar(`Category ${!currentStatus ? "activated" : "deactivated"} successfully`, "success")
      fetchCategories()
    } catch (error) {
      showSnackbar("Failed to update category status", "error")
    }
    handleMenuClose()
  }

  const handleOpenDialog = () => {
    setFormData({
      name: "",
      description: "",
      color: "#1976d2",
      icon: "category",
      isActive: true,
    })
    setEditMode(false)
    setSelectedCategory(null)
    setErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setFormData({
      name: "",
      description: "",
      color: "#1976d2",
      icon: "category",
      isActive: true,
    })
    setEditMode(false)
    setSelectedCategory(null)
    setErrors({})
  }

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget)
    setSelectedCategory(category)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedCategory(null)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="category-management-container">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
              Category Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage ticket categories and their properties
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {/* Categories Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8, borderRadius: 3 }}>
          <CardContent>
            <Category sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No categories found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first category to organize tickets
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog} sx={{ borderRadius: 2 }}>
              Add Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  },
                  opacity: category.isActive ? 1 : 0.6,
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: category.color,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <Category />
                    </Avatar>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, category)}>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                    {category.name}
                  </Typography>

                  {category.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {category.description}
                    </Typography>
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={category.isActive ? "Active" : "Inactive"}
                      color={category.isActive ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Created {formatDate(category.createdAt)}
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Created by {category.createdBy?.name}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEdit(selectedCategory)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Category</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleToggleStatus(selectedCategory?._id, selectedCategory?.isActive)}>
          <ListItemIcon>
            {selectedCategory?.isActive ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{selectedCategory?.isActive ? "Deactivate" : "Activate"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedCategory?._id)} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Category</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: "bold" }}>
                    Category Color
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {predefinedColors.map((color) => (
                      <Box
                        key={color}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: color,
                          cursor: "pointer",
                          border: formData.color === color ? "3px solid #000" : "2px solid #fff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                        onClick={() => handleInputChange("color", color)}
                      />
                    ))}
                  </Box>
                  <TextField
                    fullWidth
                    label="Custom Color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Optional description for this category"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange("isActive", e.target.checked)}
                    />
                  }
                  label="Active Category"
                />
              </Grid>

              {/* Preview */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: "bold" }}>
                    Preview:
                  </Typography>
                  <Chip
                    label={formData.name || "Category Name"}
                    sx={{
                      bgcolor: formData.color + "20",
                      color: formData.color,
                      fontWeight: "bold",
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
            disabled={submitting}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            {submitting ? "Saving..." : editMode ? "Update Category" : "Create Category"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CategoryManagement
