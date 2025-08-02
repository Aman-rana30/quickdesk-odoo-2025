"use client"
import {
  Menu,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
} from "@mui/material"
import { Notifications, ConfirmationNumber, Comment, Assignment, CheckCircle } from "@mui/icons-material"
import { useNotification } from "../../contexts/NotificationContext"
import { formatDistanceToNow } from "date-fns"

const NotificationPanel = ({ anchorEl, open, onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotification()

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ticket_created":
        return <ConfirmationNumber color="primary" />
      case "comment_added":
        return <Comment color="info" />
      case "ticket_assigned":
        return <Assignment color="warning" />
      case "status_changed":
        return <CheckCircle color="success" />
      default:
        return <Notifications />
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    if (notification.relatedTicket) {
      window.location.href = `/tickets/${notification.relatedTicket._id}`
    }
    onClose()
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          width: 400,
          maxHeight: 500,
          "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Notifications</Typography>
        {notifications.some((n) => !n.isRead) && (
          <Button size="small" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </Box>
      <Divider />

      {notifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">No notifications yet</Typography>
        </Box>
      ) : (
        <List sx={{ p: 0, maxHeight: 350, overflow: "auto" }}>
          {notifications.slice(0, 10).map((notification) => (
            <ListItem
              key={notification._id}
              button
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.isRead ? "transparent" : "action.hover",
                borderLeft: notification.isRead ? "none" : "4px solid",
                borderLeftColor: "primary.main",
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "background.paper" }}>{getNotificationIcon(notification.type)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Menu>
  )
}

export default NotificationPanel
