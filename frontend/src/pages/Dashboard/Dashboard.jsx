"use client"

import { useState, useEffect } from "react"
import { Grid, Card, CardContent, Typography, Box, Paper, CircularProgress, Chip, LinearProgress } from "@mui/material"
import { ConfirmationNumber, Assignment, CheckCircle, People } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import "./Dashboard.css"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ticketsResponse] = await Promise.all([
        user.role !== "user" ? api.get("/tickets/stats/dashboard") : Promise.resolve({ data: {} }),
        api.get("/tickets?limit=5&sortBy=createdAt&sortOrder=desc"),
      ])

      if (user.role !== "user") {
        setStats(statsResponse.data)
      }
      setRecentTickets(ticketsResponse.data.tickets)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div className="dashboard-container">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your help desk today.
        </Typography>
      </Box>

      {/* Stats Cards for Agents/Admin */}
      {user.role !== "user" && stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stats-card" sx={{ background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" sx={{ color: "white", fontWeight: "bold" }}>
                      {stats.open}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      Open Tickets
                    </Typography>
                  </Box>
                  <ConfirmationNumber sx={{ fontSize: 40, color: "rgba(255,255,255,0.8)" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="stats-card" sx={{ background: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" sx={{ color: "white", fontWeight: "bold" }}>
                      {stats.inProgress}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      In Progress
                    </Typography>
                  </Box>
                  <Assignment sx={{ fontSize: 40, color: "rgba(255,255,255,0.8)" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="stats-card" sx={{ background: "linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" sx={{ color: "white", fontWeight: "bold" }}>
                      {stats.resolved}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      Resolved
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, color: "rgba(255,255,255,0.8)" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="stats-card" sx={{ background: "linear-gradient(135deg, #5f27cd 0%, #341f97 100%)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" sx={{ color: "white", fontWeight: "bold" }}>
                      {stats.myTickets}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      My Tickets
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: "rgba(255,255,255,0.8)" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Tickets */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
              Recent Tickets
            </Typography>
            {recentTickets.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No tickets found. Create your first ticket to get started!
                </Typography>
              </Box>
            ) : (
              <Box>
                {recentTickets.map((ticket) => (
                  <Card
                    key={ticket._id}
                    sx={{
                      mb: 2,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      },
                    }}
                    onClick={() => (window.location.href = `/tickets/${ticket._id}`)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                            {ticket.subject}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {ticket.ticketId} • Created by {ticket.createdBy?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {ticket.description}
                          </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
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
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          {ticket.category?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Card
                sx={{
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
                onClick={() => (window.location.href = "/tickets/new")}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Create New Ticket
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Report an issue or request support
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)",
                  color: "white",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
                onClick={() => (window.location.href = "/tickets")}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    View All Tickets
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Browse and manage your tickets
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)",
                  color: "white",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
                onClick={() => (window.location.href = "/profile")}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Update Profile
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manage your account settings
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>

          {/* Priority Distribution for Agents/Admin */}
          {user.role !== "user" && stats?.byPriority && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
                Tickets by Priority
              </Typography>
              <Box>
                {stats.byPriority.map((item) => {
                  const total = stats.byPriority.reduce((sum, p) => sum + p.count, 0)
                  const percentage = total > 0 ? (item.count / total) * 100 : 0

                  return (
                    <Box key={item._id} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                          {item._id} Priority
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count} ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "rgba(0,0,0,0.1)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              item._id === "urgent"
                                ? "#ff6b6b"
                                : item._id === "high"
                                  ? "#feca57"
                                  : item._id === "medium"
                                    ? "#48dbfb"
                                    : "#5f27cd",
                          },
                        }}
                      />
                    </Box>
                  )
                })}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default Dashboard
