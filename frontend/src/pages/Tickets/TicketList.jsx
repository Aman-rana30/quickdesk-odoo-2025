"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Pagination,
  CircularProgress,
  InputAdornment,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { Search, Add, Sort, MoreVert, Edit, Visibility, ThumbUp, ThumbDown, Comment } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import api from "../../services/api"
import "./TicketList.css"

const TicketList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSnackbar } = useNotification()

  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    priority: "",
    sortBy: "lastActivity",
    sortOrder: "desc",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  })
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    fetchTickets()
    fetchCategories()
  }, [filters, pagination.page])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...filters,
      })

      const response = await api.get(`/tickets?${params}`)
      setTickets(response.data.tickets)
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      })
    } catch (error) {
      showSnackbar("Failed to fetch tickets", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      setCategories(response.data.categories)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }))
  }

  const handleMenuOpen = (event, ticket) => {
    setAnchorEl(event.currentTarget)
    setSelectedTicket(ticket)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedTicket(null)
  }

  const handleVote = async (ticketId, type) => {
    try {
      await api.post(`/tickets/${ticketId}/vote`, { type })
      fetchTickets()
      showSnackbar(`Vote ${type === "upvote" ? "added" : "removed"}`, "success")
    } catch (error) {
      showSnackbar("Failed to vote", "error")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "error"
      case "in-progress":
        return "warning"
      case "resolved":
        return "success"
      case "closed":
        return "default"
      default:
        return "default"
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="ticket-list-container">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
              {user?.role === "user" ? "My Tickets" : "All Tickets"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track support tickets
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/tickets/new")}
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
            Create Ticket
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority}
                    label="Priority"
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="lastActivity">Last Activity</MenuItem>
                    <MenuItem value="createdAt">Created Date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton
                  onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "desc" ? "asc" : "desc")}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <Sort />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Tickets List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : tickets.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filters.search || filters.status || filters.category || filters.priority
                ? "Try adjusting your filters"
                : "Create your first ticket to get started"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/tickets/new")}
              sx={{ borderRadius: 2 }}
            >
              Create Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {tickets.map((ticket) => (
            <Card
              key={ticket._id}
              sx={{
                mb: 2,
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1} sx={{ cursor: "pointer" }} onClick={() => navigate(`/tickets/${ticket._id}`)}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                      {ticket.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {ticket.ticketId} • Created by {ticket.createdBy?.name} • {formatDate(ticket.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
                      {ticket.description}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton onClick={(e) => handleMenuOpen(e, ticket)}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label={ticket.status.replace("-", " ").toUpperCase()}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                    <Chip
                      label={ticket.priority.toUpperCase()}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                      variant="outlined"
                    />
                    {ticket.category && (
                      <Chip
                        label={ticket.category.name}
                        size="small"
                        sx={{
                          bgcolor: ticket.category.color + "20",
                          color: ticket.category.color,
                        }}
                      />
                    )}
                    {ticket.assignedTo && (
                      <Chip label={`Assigned to ${ticket.assignedTo.name}`} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleVote(ticket._id, "upvote")}
                        color={ticket.votes?.upvotes?.some((vote) => vote.user === user?.id) ? "primary" : "default"}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                      <Typography variant="caption">{ticket.votes?.upvotes?.length || 0}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleVote(ticket._id, "downvote")}
                        color={ticket.votes?.downvotes?.some((vote) => vote.user === user?.id) ? "error" : "default"}
                      >
                        <ThumbDown fontSize="small" />
                      </IconButton>
                      <Typography variant="caption">{ticket.votes?.downvotes?.length || 0}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Comment fontSize="small" color="action" />
                      <Typography variant="caption">{ticket.comments?.length || 0}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => navigate(`/tickets/${selectedTicket?._id}`)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {(user?.role !== "user" || selectedTicket?.createdBy?._id === user?.id) && (
          <MenuItem onClick={() => navigate(`/tickets/${selectedTicket?._id}`)}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Ticket</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </div>
  )
}

export default TicketList
