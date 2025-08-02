"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
} from "@mui/material"
import {
  ArrowBack,
  Edit,
  ThumbUp,
  ThumbDown,
  AttachFile,
  Download,
  Send,
  Assignment,
  Person,
  Schedule,
  Flag,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import api from "../../services/api"
import "./TicketDetail.css"

const TicketDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSnackbar } = useNotification()

  const [ticket, setTicket] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentFiles, setCommentFiles] = useState([])
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editData, setEditData] = useState({
    status: "",
    priority: "",
    assignedTo: "",
  })

  useEffect(() => {
    fetchTicket()
    if (user?.role !== "user") {
      fetchAgents()
    }
  }, [id])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tickets/${id}`)
      setTicket(response.data.ticket)
      setEditData({
        status: response.data.ticket.status,
        priority: response.data.ticket.priority,
        assignedTo: response.data.ticket.assignedTo?._id || "",
      })
    } catch (error) {
      showSnackbar("Failed to fetch ticket details", "error")
      navigate("/tickets")
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await api.get("/users/agents")
      setAgents(response.data.agents)
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    }
  }

  const handleUpdateTicket = async () => {
    try {
      await api.put(`/tickets/${id}`, editData)
      setEditMode(false)
      fetchTicket()
      showSnackbar("Ticket updated successfully", "success")
    } catch (error) {
      showSnackbar("Failed to update ticket", "error")
    }
  }

  const handleVote = async (type) => {
    try {
      await api.post(`/tickets/${id}/vote`, { type })
      fetchTicket()
      showSnackbar(`Vote ${type === "upvote" ? "added" : "removed"}`, "success")
    } catch (error) {
      showSnackbar("Failed to vote", "error")
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return

    try {
      setSubmittingComment(true)
      const formData = new FormData()
      formData.append("content", commentText)
      commentFiles.forEach((file) => {
        formData.append("attachments", file)
      })

      await api.post(`/tickets/${id}/comments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setCommentText("")
      setCommentFiles([])
      fetchTicket()
      showSnackbar("Comment added successfully", "success")
    } catch (error) {
      showSnackbar("Failed to add comment", "error")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    setCommentFiles(files)
  }

  const downloadFile = (filename) => {
    window.open(`http://localhost:5000/uploads/${filename}`, "_blank")
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (!ticket) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Ticket not found
        </Typography>
      </Box>
    )
  }

  return (
    <div className="ticket-detail-container">
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate("/tickets")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "primary.main" }}>
            {ticket.subject}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ticket.ticketId} • Created {formatDate(ticket.createdAt)}
          </Typography>
        </Box>
        {(user?.role !== "user" || ticket.createdBy._id === user?.id) && (
          <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditMode(true)} sx={{ borderRadius: 2 }}>
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Ticket Details */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
                    {ticket.description}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <IconButton
                      onClick={() => handleVote("upvote")}
                      color={ticket.votes?.upvotes?.some((vote) => vote.user === user?.id) ? "primary" : "default"}
                    >
                      <ThumbUp />
                    </IconButton>
                    <Typography variant="body2">{ticket.votes?.upvotes?.length || 0}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <IconButton
                      onClick={() => handleVote("downvote")}
                      color={ticket.votes?.downvotes?.some((vote) => vote.user === user?.id) ? "error" : "default"}
                    >
                      <ThumbDown />
                    </IconButton>
                    <Typography variant="body2">{ticket.votes?.downvotes?.length || 0}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                    Attachments
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {ticket.attachments.map((file, index) => (
                      <Chip
                        key={index}
                        icon={<AttachFile />}
                        label={file.originalName}
                        onClick={() => downloadFile(file.filename)}
                        clickable
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Comments ({ticket.comments?.length || 0})
              </Typography>

              {/* Comments List */}
              <List>
                {ticket.comments?.map((comment, index) => (
                  <Box key={comment._id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>{comment.user?.name?.charAt(0).toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                              {comment.user?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(comment.createdAt)}
                            </Typography>
                            {comment.isInternal && (
                              <Chip label="Internal" size="small" color="warning" variant="outlined" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
                              {comment.content}
                            </Typography>
                            {comment.attachments && comment.attachments.length > 0 && (
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {comment.attachments.map((file, fileIndex) => (
                                  <Chip
                                    key={fileIndex}
                                    icon={<Download />}
                                    label={file.originalName}
                                    onClick={() => downloadFile(file.filename)}
                                    clickable
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < ticket.comments.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>

              {/* Add Comment */}
              {(user?.role !== "user" || ticket.createdBy._id === user?.id) && (
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                    Add Comment
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Write your comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <input
                        accept="*/*"
                        style={{ display: "none" }}
                        id="comment-file-upload"
                        multiple
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="comment-file-upload">
                        <Button variant="outlined" component="span" startIcon={<AttachFile />} sx={{ mr: 1 }}>
                          Attach Files
                        </Button>
                      </label>
                      {commentFiles.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {commentFiles.length} file(s) selected
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || submittingComment}
                      sx={{ borderRadius: 2 }}
                    >
                      {submittingComment ? <CircularProgress size={20} /> : "Add Comment"}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Ticket Info */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Ticket Information
              </Typography>

              <Box display="flex" alignItems="center" mb={2}>
                <Flag sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={ticket.status.replace("-", " ").toUpperCase()}
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </Box>
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <Flag sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={ticket.priority.toUpperCase()}
                    color={getPriorityColor(ticket.priority)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <Person sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {ticket.createdBy?.name}
                  </Typography>
                </Box>
              </Box>

              {ticket.assignedTo && (
                <Box display="flex" alignItems="center" mb={2}>
                  <Assignment sx={{ mr: 1, color: "text.secondary" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Assigned To
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {ticket.assignedTo.name}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box display="flex" alignItems="center" mb={2}>
                <Schedule sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Activity
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {formatDate(ticket.lastActivity)}
                  </Typography>
                </Box>
              </Box>

              {ticket.category && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  <Chip
                    label={ticket.category.name}
                    sx={{
                      bgcolor: ticket.category.color + "20",
                      color: ticket.category.color,
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Activity Timeline
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "success.main", width: 32, height: 32 }}>
                      <Person fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Ticket Created"
                    secondary={formatDate(ticket.createdAt)}
                    primaryTypographyProps={{ variant: "body2", fontWeight: "bold" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
                {ticket.resolvedAt && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "info.main", width: 32, height: 32 }}>
                        <Assignment fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Ticket Resolved"
                      secondary={formatDate(ticket.resolvedAt)}
                      primaryTypographyProps={{ variant: "body2", fontWeight: "bold" }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                )}
                {ticket.closedAt && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "grey.500", width: 32, height: 32 }}>
                        <Assignment fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Ticket Closed"
                      secondary={formatDate(ticket.closedAt)}
                      primaryTypographyProps={{ variant: "body2", fontWeight: "bold" }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editData.status}
                label="Status"
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>

            {user?.role !== "user" && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editData.priority}
                    label="Priority"
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    value={editData.assignedTo}
                    label="Assign To"
                    onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {agents.map((agent) => (
                      <MenuItem key={agent._id} value={agent._id}>
                        {agent.name} ({agent.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)}>Cancel</Button>
          <Button onClick={handleUpdateTicket} variant="contained">
            Update Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default TicketDetail
