"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { Search, Visibility, Assignment, ConfirmationNumber, Schedule } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import api from "../../services/api"

const AgentDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSnackbar } = useNotification()

  const [activeTab, setActiveTab] = useState(0)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
  })

  useEffect(() => {
    fetchStats()
    fetchTickets()
  }, [activeTab, filters])

  const fetchStats = async () => {
    try {
      const response = await api.get("/tickets/stats/dashboard")
      setStats(response.data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: 20,
        sortBy: "lastActivity",
        sortOrder: "desc",
        ...filters,
      })

      // Add tab-specific filters
      if (activeTab === 0) {
        // My Tickets
        params.append("assignedTo", user.id)
      }
      // Tab 1 is All Tickets (no additional filter needed)

      const response = await api.get(`/tickets?${params}`)
      setTickets(response.data.tickets)
    } catch (error) {
      showSnackbar("Failed to fetch tickets", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleAssignToMe = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}`, {
        assignedTo: user.id,
        status: "in-progress",
      })
      fetchTickets()
      fetchStats()
      showSnackbar("Ticket assigned to you", "success")
    } catch (error) {
      showSnackbar("Failed to assign ticket", "error")
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Box>
      {/* Stats Cards */}
      {stats && (
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Card sx={{ minWidth: 200, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ConfirmationNumber color="error" />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {stats.open}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Tickets
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Schedule color="warning" />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Assignment color="primary" />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {stats.myTickets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    My Tickets
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Ticket Queues */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 3, pt: 2 }}>
              <Tab label="My Tickets" />
              <Tab label="All Tickets" />
            </Tabs>
          </Box>

          {/* Filters */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
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
                sx={{ minWidth: 250 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Tickets Table */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Ticket</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Created By</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Last Activity</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket._id} sx={{ "&:hover": { bgcolor: "grey.50" } }}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            {ticket.subject}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ticket.ticketId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status.replace("-", " ").toUpperCase()}
                          color={getStatusColor(ticket.status)}
                          size="small"
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
                          <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                            {ticket.createdBy?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">{ticket.createdBy?.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(ticket.lastActivity)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton size="small" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                            <Visibility />
                          </IconButton>
                          {!ticket.assignedTo && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAssignToMe(ticket._id)}
                              sx={{ minWidth: "auto", px: 1 }}
                            >
                              Assign
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default AgentDashboard
