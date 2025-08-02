"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material"
import { ArrowBack, AttachFile, Delete, Send } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import api from "../../services/api"
import "./CreateTicket.css"

const CreateTicket = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSnackbar } = useNotification()

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium",
  })
  const [categories, setCategories] = useState([])
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      setCategories(response.data.categories)
    } catch (error) {
      showSnackbar("Failed to fetch categories", "error")
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        showSnackbar(`File ${file.name} is too large. Maximum size is 10MB.`, "error")
        return false
      }
      return true
    })
    setAttachments((prev) => [...prev, ...validFiles])
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showSnackbar("Please fill in all required fields", "error")
      return
    }

    try {
      setLoading(true)

      console.log("Submitting form data:", {
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        attachmentsCount: attachments.length,
      })

      const submitData = new FormData()

      // Ensure all required fields are properly set
      submitData.append("subject", formData.subject.trim())
      submitData.append("description", formData.description.trim())
      submitData.append("category", formData.category)
      submitData.append("priority", formData.priority)

      // Add attachments
      attachments.forEach((file, index) => {
        submitData.append("attachments", file)
        console.log(`Attachment ${index}:`, file.name, file.size)
      })

      // Debug: Log FormData contents
      console.log("FormData contents:")
      for (const [key, value] of submitData.entries()) {
        console.log(key, value)
      }

      const response = await api.post("/tickets", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Ticket creation response:", response.data)
      showSnackbar("Ticket created successfully!", "success")
      navigate(`/tickets/${response.data.ticket._id}`)
    } catch (error) {
      console.error("Ticket creation error:", error)
      console.error("Error response:", error.response?.data)

      const errorMessage = error.response?.data?.message || "Failed to create ticket"
      const errors = error.response?.data?.errors

      if (errors && Array.isArray(errors)) {
        showSnackbar(`${errorMessage}: ${errors.join(", ")}`, "error")
      } else {
        showSnackbar(errorMessage, "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "error"
      case "high":
        return "warning"
      case "medium":
        return "info"
      case "low":
        return "success"
      default:
        return "default"
    }
  }

  return (
    <div className="create-ticket-container">
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton onClick={() => navigate("/tickets")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "primary.main" }}>
            Create New Ticket
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Describe your issue or request for support
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Subject */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      placeholder="Brief description of your issue"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      error={!!errors.subject}
                      helperText={errors.subject}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>

                  {/* Category and Priority */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.category} required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category}
                        label="Category"
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category._id} value={category._id}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  bgcolor: category.color,
                                }}
                              />
                              {category.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.category}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={formData.priority}
                        label="Priority"
                        onChange={(e) => handleInputChange("priority", e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="low">
                          <Chip label="Low" color="success" size="small" sx={{ mr: 1 }} />
                          Low Priority
                        </MenuItem>
                        <MenuItem value="medium">
                          <Chip label="Medium" color="info" size="small" sx={{ mr: 1 }} />
                          Medium Priority
                        </MenuItem>
                        <MenuItem value="high">
                          <Chip label="High" color="warning" size="small" sx={{ mr: 1 }} />
                          High Priority
                        </MenuItem>
                        <MenuItem value="urgent">
                          <Chip label="Urgent" color="error" size="small" sx={{ mr: 1 }} />
                          Urgent Priority
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      placeholder="Provide detailed information about your issue..."
                      multiline
                      rows={6}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      error={!!errors.description}
                      helperText={
                        errors.description || "Be as specific as possible to help us resolve your issue quickly"
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>

                  {/* File Attachments */}
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                        Attachments
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload files to help explain your issue (Max 10MB per file)
                      </Typography>

                      <input
                        accept="*/*"
                        style={{ display: "none" }}
                        id="file-upload"
                        multiple
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<AttachFile />}
                          sx={{
                            borderRadius: 2,
                            mb: 2,
                            borderStyle: "dashed",
                            py: 1.5,
                            px: 3,
                          }}
                        >
                          Choose Files
                        </Button>
                      </label>

                      {attachments.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold" }}>
                            Selected Files:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {attachments.map((file, index) => (
                              <Chip
                                key={index}
                                label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                                onDelete={() => removeAttachment(index)}
                                deleteIcon={<Delete />}
                                variant="outlined"
                                sx={{ maxWidth: 300 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button variant="outlined" onClick={() => navigate("/tickets")} sx={{ borderRadius: 2, px: 3 }}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                        disabled={loading}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                          },
                        }}
                      >
                        {loading ? "Creating..." : "Create Ticket"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Tips */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                💡 Tips for Better Support
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Be specific about the problem you're experiencing
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Include steps to reproduce the issue
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Attach screenshots or error messages if applicable
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Choose the appropriate priority level
                </Typography>
                <Typography component="li" variant="body2">
                  Select the most relevant category
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Priority Guide */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                🚨 Priority Levels
              </Typography>
              <Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip label="Urgent" color="error" size="small" sx={{ mr: 2, minWidth: 70 }} />
                  <Typography variant="body2">System down, critical business impact</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip label="High" color="warning" size="small" sx={{ mr: 2, minWidth: 70 }} />
                  <Typography variant="body2">Significant impact, needs quick resolution</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip label="Medium" color="info" size="small" sx={{ mr: 2, minWidth: 70 }} />
                  <Typography variant="body2">Normal business impact, standard timeline</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Chip label="Low" color="success" size="small" sx={{ mr: 2, minWidth: 70 }} />
                  <Typography variant="body2">Minor issue, can wait for resolution</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default CreateTicket
