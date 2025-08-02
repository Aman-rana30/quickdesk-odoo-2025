const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const Ticket = require("../models/Ticket")
const User = require("../models/User")
const Category = require("../models/Category")
const Notification = require("../models/Notification")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("Created uploads directory for tickets:", uploadsDir)
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")
    cb(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedName}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    console.log("File upload attempt:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })

    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|xlsx|xls|ppt|pptx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.originalname}. Allowed types: jpeg, jpg, png, gif, pdf, doc, docx, txt, zip, rar, xlsx, xls, ppt, pptx`,
        ),
      )
    }
  },
})

// Create ticket
router.post("/", auth, (req, res, next) => {
  console.log("Create ticket request received from user:", req.user?.name)
  console.log("Request body:", req.body)
  console.log("Request headers:", req.headers)

  upload.array("attachments", 5)(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err)
      return res.status(400).json({
        message: err.message || "File upload error",
        error: err.code || "UPLOAD_ERROR",
      })
    }

    try {
      const { subject, description, category, priority } = req.body

      console.log("Processing ticket creation:", {
        subject: subject || "MISSING",
        description: description ? description.substring(0, 100) + "..." : "MISSING",
        category: category || "MISSING",
        priority: priority || "MISSING",
        filesCount: req.files?.length || 0,
      })

      // Validate required fields with detailed error messages
      const validationErrors = []

      if (!subject || !subject.trim()) {
        validationErrors.push("Subject is required and cannot be empty")
      }

      if (!description || !description.trim()) {
        validationErrors.push("Description is required and cannot be empty")
      }

      if (!category || category.trim() === "") {
        validationErrors.push("Category is required")
      }

      if (validationErrors.length > 0) {
        console.log("Validation errors:", validationErrors)
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors,
          receivedData: { subject, description, category, priority },
        })
      }

      // Validate category exists and is active
      let categoryExists
      try {
        categoryExists = await Category.findOne({
          _id: category,
          isActive: true,
        })
      } catch (categoryError) {
        console.error("Category validation error:", categoryError)
        return res.status(400).json({
          message: "Invalid category ID format",
          error: categoryError.message,
        })
      }

      if (!categoryExists) {
        console.log("Category not found or inactive:", category)
        return res.status(400).json({
          message: "Invalid or inactive category selected",
          categoryId: category,
        })
      }

      // Process attachments
      const attachments = req.files
        ? req.files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
          }))
        : []

      console.log("Processed attachments:", attachments.length)

      // Create ticket with better error handling
      const ticketData = {
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority: priority || "medium",
        createdBy: req.user._id,
        attachments,
      }

      console.log("Creating ticket with data:", ticketData)

      // Create the ticket instance
      const ticket = new Ticket(ticketData)

      // Manually generate ticketId if not set (additional safety)
      if (!ticket.ticketId) {
        const timestamp = Date.now()
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")
        ticket.ticketId = `QD-${timestamp}-${random}`
        console.log("Manually set ticket ID:", ticket.ticketId)
      }

      // Save the ticket
      await ticket.save()
      console.log("Ticket saved successfully with ID:", ticket._id, "TicketID:", ticket.ticketId)

      // Populate ticket data
      await ticket.populate([
        { path: "createdBy", select: "name email" },
        { path: "category", select: "name color" },
      ])

      // Create notifications for agents and admins (non-blocking)
      setImmediate(async () => {
        try {
          const agents = await User.find({
            role: { $in: ["agent", "admin"] },
            isActive: true,
          })

          if (agents.length > 0) {
            const notifications = agents.map((agent) => ({
              recipient: agent._id,
              sender: req.user._id,
              type: "ticket_created",
              title: "New Ticket Created",
              message: `New ticket "${subject}" has been created by ${req.user.name}`,
              relatedTicket: ticket._id,
            }))

            await Notification.insertMany(notifications)
            console.log(`Created ${notifications.length} notifications`)
          }
        } catch (notificationError) {
          console.error("Failed to create notifications:", notificationError)
        }
      })

      res.status(201).json({
        message: "Ticket created successfully",
        ticket,
      })
    } catch (error) {
      console.error("Create ticket error:", error)
      console.error("Error stack:", error.stack)

      // Clean up uploaded files if ticket creation fails
      if (req.files) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path)
              console.log("Cleaned up file:", file.filename)
            }
          } catch (unlinkError) {
            console.error("Failed to delete uploaded file:", unlinkError)
          }
        })
      }

      // Handle specific errors
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((e) => e.message)
        console.log("Mongoose validation errors:", errors)
        return res.status(400).json({
          message: "Validation failed",
          errors,
          mongooseError: true,
        })
      }

      if (error.code === 11000) {
        console.log("Duplicate key error:", error)
        return res.status(400).json({
          message: "Duplicate ticket ID. Please try again.",
        })
      }

      res.status(500).json({
        message: "Failed to create ticket",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      })
    }
  })
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

    console.log("Get tickets request:", { page, limit, status, category, priority, search })

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

    // Handle different sorting options
    if (sortBy === "mostReplied") {
      // Sort by number of comments
      const tickets = await Ticket.aggregate([
        { $match: query },
        {
          $addFields: {
            commentCount: { $size: "$comments" },
          },
        },
        { $sort: { commentCount: sortOrder === "desc" ? -1 : 1 } },
        { $skip: (page - 1) * limit },
        { $limit: Number.parseInt(limit) },
      ])

      await Ticket.populate(tickets, [
        { path: "createdBy", select: "name email" },
        { path: "assignedTo", select: "name email" },
        { path: "category", select: "name color" },
      ])

      const total = await Ticket.countDocuments(query)

      return res.json({
        tickets,
        totalPages: Math.ceil(total / limit),
        currentPage: Number.parseInt(page),
        total,
      })
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "name color")
      .sort(sortOptions)
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit))

    const total = await Ticket.countDocuments(query)

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: Number.parseInt(page),
      total,
    })
  } catch (error) {
    console.error("Get tickets error:", error)
    res.status(500).json({ message: "Failed to fetch tickets", error: error.message })
  }
})

// Get single ticket
router.get("/:id", auth, async (req, res) => {
  try {
    console.log("Get ticket request for ID:", req.params.id)

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
    console.error("Get ticket error:", error)

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID format" })
    }

    res.status(500).json({ message: "Failed to fetch ticket", error: error.message })
  }
})

// Update ticket
router.put("/:id", auth, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body
    console.log("Update ticket request:", { id: req.params.id, status, priority, assignedTo })

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
    if (assignedTo !== undefined && req.user.role !== "user") {
      ticket.assignedTo = assignedTo || null
    }

    if (status === "resolved") ticket.resolvedAt = new Date()
    if (status === "closed") ticket.closedAt = new Date()

    await ticket.save()
    await ticket.populate([
      { path: "createdBy", select: "name email" },
      { path: "assignedTo", select: "name email" },
      { path: "category", select: "name color" },
    ])

    // Create notification if status changed (non-blocking)
    if (status && status !== oldStatus) {
      setImmediate(async () => {
        try {
          const notification = new Notification({
            recipient: ticket.createdBy._id,
            sender: req.user._id,
            type: "status_changed",
            title: "Ticket Status Updated",
            message: `Ticket "${ticket.subject}" status changed from ${oldStatus} to ${status}`,
            relatedTicket: ticket._id,
          })
          await notification.save()
        } catch (notificationError) {
          console.error("Failed to create notification:", notificationError)
        }
      })
    }

    res.json({
      message: "Ticket updated successfully",
      ticket,
    })
  } catch (error) {
    console.error("Update ticket error:", error)
    res.status(500).json({ message: "Failed to update ticket", error: error.message })
  }
})

// Add comment to ticket
router.post("/:id/comments", auth, (req, res) => {
  upload.array("attachments", 3)(req, res, async (err) => {
    if (err) {
      console.error("Comment upload error:", err)
      return res.status(400).json({ message: err.message || "File upload error" })
    }

    try {
      const { content, isInternal } = req.body
      const ticket = await Ticket.findById(req.params.id)

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" })
      }

      // Check permissions - only ticket creator or agents can comment
      if (req.user.role === "user" && ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" })
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment content is required" })
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
        content: content.trim(),
        attachments,
        isInternal: isInternal && req.user.role !== "user",
      }

      ticket.comments.push(comment)
      await ticket.save()
      await ticket.populate("comments.user", "name email avatar")

      // Create notification (non-blocking)
      const recipientId = req.user._id.toString() === ticket.createdBy.toString() ? ticket.assignedTo : ticket.createdBy

      if (recipientId) {
        setImmediate(async () => {
          try {
            const notification = new Notification({
              recipient: recipientId,
              sender: req.user._id,
              type: "comment_added",
              title: "New Comment Added",
              message: `New comment added to ticket "${ticket.subject}"`,
              relatedTicket: ticket._id,
            })
            await notification.save()
          } catch (notificationError) {
            console.error("Failed to create notification:", notificationError)
          }
        })
      }

      const newComment = ticket.comments[ticket.comments.length - 1]
      res.json({
        message: "Comment added successfully",
        comment: newComment,
      })
    } catch (error) {
      console.error("Add comment error:", error)

      // Clean up uploaded files if comment creation fails
      if (req.files) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path)
            }
          } catch (unlinkError) {
            console.error("Failed to delete uploaded file:", unlinkError)
          }
        })
      }

      res.status(500).json({ message: "Failed to add comment", error: error.message })
    }
  })
})

// Vote on ticket
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const { type } = req.body

    if (!type || !["upvote", "downvote"].includes(type)) {
      return res.status(400).json({ message: "Invalid vote type. Must be 'upvote' or 'downvote'" })
    }

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
    console.error("Vote error:", error)
    res.status(500).json({ message: "Failed to record vote", error: error.message })
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
    console.error("Stats error:", error)
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message })
  }
})

module.exports = router
