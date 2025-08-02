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
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material"
import { Add, Search, Visibility, Edit, ArrowUpward, ArrowDownward, Person, Schedule } from "@mui/icons-material"
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
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchTickets()
    fetchCategories()
  }, [filters, pagination.page])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }

      const response = await api.get("/tickets", { params })
      setTickets(response.data.tickets)
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }))
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

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleSort = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === "desc" ? "asc" : "desc"
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: newOrder,
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "primary"
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="ticket-list-container">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "primary.main" }}>
            Support Tickets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your support requests
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
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
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

            <Grid item xs={12} md={3}>
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
                  <MenuItem value="mostReplied">Most Replied</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <CircularProgress />
            </Box>
          ) : tickets.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tickets found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {filters.search || filters.status || filters.category || filters.priority
                  ? "Try adjusting your filters"
                  : "Create your first support ticket"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/tickets/new")}
                sx={{ borderRadius: 2 }}
              >
                Create Ticket
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          Ticket ID
                          <IconButton size="small" onClick={() => handleSort("ticketId")}>
                            {filters.sortBy === "ticketId" && filters.sortOrder === "desc" ? (
                              <ArrowDownward fontSize="small" />
                            ) : (
                              <ArrowUpward fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          Subject
                          <IconButton size="small" onClick={() => handleSort("subject")}>
                            {filters.sortBy === "subject" && filters.sortOrder === "desc" ? (
                              <ArrowDownward fontSize="small" />
                            ) : (
                              <ArrowUpward fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Category</TableCell>
                      {user?.role !== "user" && <TableCell>Created By</TableCell>}
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          Last Activity
                          <IconButton size="small" onClick={() => handleSort("lastActivity")}>
                            {filters.sortBy === "lastActivity" && filters.sortOrder === "desc" ? (
                              <ArrowDownward fontSize="small" />
                            ) : (
                              <ArrowUpward fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket._id} hover sx={{ cursor: "pointer" }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {ticket.ticketId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 200 }}>
                              {ticket.subject}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ticket.comments?.length || 0} comments
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.status.replace("-", " ").toUpperCase()}
                            color={getStatusColor(ticket.status)}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.priority.toUpperCase()}
                            color={getPriorityColor(ticket.priority)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: ticket.category?.color || "grey.400",
                              }}
                            />
                            <Typography variant="body2">{ticket.category?.name}</Typography>
                          </Box>
                        </TableCell>
                        {user?.role !== "user" && (
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Person fontSize="small" color="action" />
                              <Typography variant="body2">{ticket.createdBy?.name}</Typography>
                            </Box>
                          </TableCell>
                        )}
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Schedule fontSize="small" color="action" />
                            <Typography variant="body2">{formatDate(ticket.lastActivity)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/tickets/${ticket._id}`)}
                                sx={{ color: "primary.main" }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {(user?.role !== "user" || ticket.createdBy?._id === user?._id) && (
                              <Tooltip title="Edit Ticket">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/tickets/${ticket._id}`)}
                                  sx={{ color: "warning.main" }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box display="flex" justifyContent="center" py={3}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TicketList
