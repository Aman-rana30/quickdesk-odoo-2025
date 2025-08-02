"use client"

import { useState, useEffect } from "react"
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Avatar,
} from "@mui/material"
import { Search, MoreVert, Edit, Block, CheckCircle, Person, AdminPanelSettings, Support } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import api from "../../services/api"
import "./UserManagement.css"

const UserManagement = () => {
  const { user } = useAuth()
  const { showSnackbar } = useNotification()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    role: "",
  })
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [editDialog, setEditDialog] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [editData, setEditData] = useState({
    role: "",
    isActive: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [filters, pagination.page, pagination.rowsPerPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
        ...filters,
      })

      const response = await api.get(`/users?${params}`)
      setUsers(response.data.users)
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }))
    } catch (error) {
      showSnackbar("Failed to fetch users", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setPagination((prev) => ({ ...prev, page: 0 }))
  }

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleRowsPerPageChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: Number.parseInt(event.target.value, 10),
      page: 0,
    }))
  }

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleEditUser = () => {
    setEditData({
      role: selectedUser.role,
      isActive: selectedUser.isActive,
    })
    setEditDialog(true)
    handleMenuClose()
  }

  const handleUpdateUser = async () => {
    try {
      // Update role
      await api.put(`/users/${selectedUser._id}/role`, {
        role: editData.role,
      })

      // Update status
      await api.put(`/users/${selectedUser._id}/status`, {
        isActive: editData.isActive,
      })

      setEditDialog(false)
      fetchUsers()
      showSnackbar("User updated successfully", "success")
    } catch (error) {
      showSnackbar("Failed to update user", "error")
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/status`, {
        isActive: !currentStatus,
      })
      fetchUsers()
      showSnackbar(`User ${!currentStatus ? "activated" : "deactivated"} successfully`, "success")
    } catch (error) {
      showSnackbar("Failed to update user status", "error")
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error"
      case "agent":
        return "warning"
      case "user":
        return "primary"
      default:
        return "default"
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <AdminPanelSettings fontSize="small" />
      case "agent":
        return <Support fontSize="small" />
      case "user":
        return <Person fontSize="small" />
      default:
        return <Person fontSize="small" />
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="user-management-container">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user accounts, roles, and permissions
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 300,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={(e) => handleFilterChange("role", e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Last Login</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow
                        key={userItem._id}
                        sx={{
                          "&:hover": { bgcolor: "grey.50" },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: "primary.main" }}>{userItem.name.charAt(0).toUpperCase()}</Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                {userItem.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {userItem.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(userItem.role)}
                            label={userItem.role.toUpperCase()}
                            color={getRoleColor(userItem.role)}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userItem.isActive ? "Active" : "Inactive"}
                            color={userItem.isActive ? "success" : "error"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(userItem.createdAt)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {userItem.lastLogin ? formatDate(userItem.lastLogin) : "Never"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={(e) => handleMenuOpen(e, userItem)} disabled={userItem._id === user?.id}>
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={pagination.total}
                page={pagination.page}
                onPageChange={handlePageChange}
                rowsPerPage={pagination.rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditUser}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleToggleStatus(selectedUser?._id, selectedUser?.isActive)
            handleMenuClose()
          }}
        >
          <ListItemIcon>
            {selectedUser?.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{selectedUser?.isActive ? "Deactivate" : "Activate"}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedUser && (
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ bgcolor: "primary.main" }}>{selectedUser.name.charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={editData.role}
                label="Role"
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              >
                <MenuItem value="user">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person fontSize="small" />
                    User
                  </Box>
                </MenuItem>
                <MenuItem value="agent">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Support fontSize="small" />
                    Agent
                  </Box>
                </MenuItem>
                <MenuItem value="admin">
                  <Box display="flex" alignItems="center" gap={1}>
                    <AdminPanelSettings fontSize="small" />
                    Admin
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editData.isActive}
                label="Status"
                onChange={(e) => setEditData({ ...editData, isActive: e.target.value })}
              >
                <MenuItem value={true}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle fontSize="small" color="success" />
                    Active
                  </Box>
                </MenuItem>
                <MenuItem value={false}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Block fontSize="small" color="error" />
                    Inactive
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default UserManagement
