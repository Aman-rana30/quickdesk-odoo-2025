const express = require("express")
const multer = require("multer")
const path = require("path")
const Ticket = require("../models/Ticket")
const User = require("../models/User")
const Category = require("../models/Category")
const Notification = require("../models/Notification")
const { auth, authorize } = require("../middleware/auth")
const fs = require("fs")

const router = express.Router()

// Configure multer for file uploads
const uploadDir = "uploads"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

// Create ticket
router.post("/", auth, upload.array("attachments", 5), async (req, res) => {
  try {
    const { subject, description, category, priority } = req.body

    const attachments =
      req.files && req.files.length > 0
        ? req.files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
          }))
        : []

    const ticket = new Ticket({
      subject,
      description,
      category,
      priority: priority || "medium",
      createdBy: req.user._id,
      attachments,
    })

    await ticket.save()
    await ticket.populate(["createdBy", "category"])

    // Create notification for agents
    const agents = await User.find({ role: { $in: ["agent", "admin"] } })
    if (agents.length > 0) {
      const notifications = agents.map((agent) => ({
        recipient: agent._id,
        sender: req.user._id,
        type: "ticket_created",
        title: "New Ticket Created",
        message: `New ticket "${subject}" has been created`,
        relatedTicket: ticket._id,
      }))

      await Notification.insertMany(notifications)
    }

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    })
  } catch (error) {
    console.error("Ticket creation error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get tickets with filtering and pagination
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search,
      sortBy = "lastActivity",
      sortOrder = "desc",
      assignedTo,
      createdBy,
    } = req.query

    const query = {}

    // Role-based filtering
    if (req.user.role === "user") {
      query.createdBy = req.user._id
    }

    // Apply filters
    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority
    if (assignedTo) query.assignedTo = assignedTo
    if (createdBy && req.user.role !== "user") query.createdBy = createdBy

    // Search functionality
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ticketId: { $regex: search, $options: "i" } },
      ]
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "name color")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Ticket.countDocuments(query)

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single ticket
router.get("/:id", auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("assignedTo", "name email avatar")
      .populate("category", "name color icon")
      .populate("comments.user", "name email avatar")

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check permissions
    if (req.user.role === "user" && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({ ticket })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update ticket
router.put("/:id", auth, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check permissions
    if (req.user.role === "user" && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    const oldStatus = ticket.status

    if (status) ticket.status = status
    if (priority && req.user.role !== "user") ticket.priority = priority
    if (assignedTo && req.user.role !== "user") ticket.assignedTo = assignedTo

    if (status === "resolved") ticket.resolvedAt = new Date()
    if (status === "closed") ticket.closedAt = new Date()

    await ticket.save()
    await ticket.populate(["createdBy", "assignedTo", "category"])

    // Create notification if status changed
    if (status && status !== oldStatus) {
      const notification = new Notification({
        recipient: ticket.createdBy._id,
        sender: req.user._id,
        type: "status_changed",
        title: "Ticket Status Updated",
        message: `Ticket status changed from ${oldStatus} to ${status}`,
        relatedTicket: ticket._id,
      })
      await notification.save()
    }

    res.json({
      message: "Ticket updated successfully",
      ticket,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add comment to ticket
router.post("/:id/comments", auth, upload.array("attachments", 3), async (req, res) => {
  try {
    const { content, isInternal } = req.body
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check permissions
    if (req.user.role === "user" && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    const attachments = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
        }))
      : []

    const comment = {
      user: req.user._id,
      content,
      attachments,
      isInternal: isInternal && req.user.role !== "user",
    }

    ticket.comments.push(comment)
    await ticket.save()
    await ticket.populate("comments.user", "name email avatar")

    // Create notification
    const recipientId = req.user._id.toString() === ticket.createdBy.toString() ? ticket.assignedTo : ticket.createdBy

    if (recipientId) {
      const notification = new Notification({
        recipient: recipientId,
        sender: req.user._id,
        type: "comment_added",
        title: "New Comment Added",
        message: `New comment added to ticket "${ticket.subject}"`,
        relatedTicket: ticket._id,
      })
      await notification.save()
    }

    res.json({
      message: "Comment added successfully",
      comment: ticket.comments[ticket.comments.length - 1],
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Vote on ticket
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const { type } = req.body // 'upvote' or 'downvote'
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    const userId = req.user._id

    // Remove existing votes by this user
    ticket.votes.upvotes = ticket.votes.upvotes.filter((vote) => vote.user.toString() !== userId.toString())
    ticket.votes.downvotes = ticket.votes.downvotes.filter((vote) => vote.user.toString() !== userId.toString())

    // Add new vote
    if (type === "upvote") {
      ticket.votes.upvotes.push({ user: userId })
    } else if (type === "downvote") {
      ticket.votes.downvotes.push({ user: userId })
    }

    await ticket.save()

    res.json({
      message: "Vote recorded successfully",
      upvotes: ticket.votes.upvotes.length,
      downvotes: ticket.votes.downvotes.length,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get ticket statistics
router.get("/stats/dashboard", auth, authorize("agent", "admin"), async (req, res) => {
  try {
    const stats = await Promise.all([
      Ticket.countDocuments({ status: "open" }),
      Ticket.countDocuments({ status: "in-progress" }),
      Ticket.countDocuments({ status: "resolved" }),
      Ticket.countDocuments({ status: "closed" }),
      Ticket.countDocuments({ assignedTo: req.user._id }),
      Ticket.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    ])

    res.json({
      open: stats[0],
      inProgress: stats[1],
      resolved: stats[2],
      closed: stats[3],
      myTickets: stats[4],
      byPriority: stats[5],
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
