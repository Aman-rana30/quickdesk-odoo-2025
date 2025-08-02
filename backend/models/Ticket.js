const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
      },
    ],
    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Priority must be one of: low, medium, high, urgent",
      },
      default: "medium",
    },
    status: {
      type: String,
      enum: {
        values: ["open", "in-progress", "resolved", "closed"],
        message: "Status must be one of: open, in-progress, resolved, closed",
      },
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
      },
    ],
    comments: [commentSchema],
    votes: {
      upvotes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      downvotes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    tags: [String],
    resolvedAt: Date,
    closedAt: Date,
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Generate ticket ID - Fixed version
ticketSchema.pre("save", async function (next) {
  if (!this.ticketId) {
    try {
      // Use a more reliable method to generate ticket ID
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")

      // Try to get count, but fallback to timestamp if it fails
      let count
      try {
        count = await this.constructor.countDocuments()
      } catch (countError) {
        console.warn("Failed to get document count, using timestamp:", countError)
        count = timestamp % 1000000 // Use last 6 digits of timestamp
      }

      this.ticketId = `QD-${String(count + 1).padStart(6, "0")}-${random}`
      console.log("Generated ticket ID:", this.ticketId)
    } catch (error) {
      console.error("Error generating ticket ID:", error)
      // Fallback to timestamp-based ID
      const fallbackId = `QD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      this.ticketId = fallbackId
      console.log("Using fallback ticket ID:", fallbackId)
    }
  }

  this.lastActivity = new Date()
  next()
})

// Index for better performance
ticketSchema.index({ createdBy: 1, status: 1 })
ticketSchema.index({ assignedTo: 1, status: 1 })
ticketSchema.index({ category: 1 })
ticketSchema.index({ ticketId: 1 })
ticketSchema.index({ lastActivity: -1 })

module.exports = mongoose.model("Ticket", ticketSchema)
