const express = require("express")
const Notification = require("../models/Notification")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get user notifications
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query

    const query = { recipient: req.user._id }
    if (unreadOnly === "true") {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name email")
      .populate("relatedTicket", "ticketId subject")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    })

    res.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    notification.isRead = true
    notification.readAt = new Date()
    await notification.save()

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Mark all notifications as read
router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
