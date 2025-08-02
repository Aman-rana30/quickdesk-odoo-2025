const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const fs = require("fs")
const multer = require("multer") // Import multer

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const ticketRoutes = require("./routes/tickets")
const userRoutes = require("./routes/users")
const categoryRoutes = require("./routes/categories")
const notificationRoutes = require("./routes/notifications")

const app = express()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("Created uploads directory:", uploadsDir)
}

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.method === "POST" && req.path === "/api/tickets") {
    console.log("Ticket creation request body keys:", Object.keys(req.body))
  }
  next()
})

// Static files for uploads
app.use("/uploads", express.static(uploadsDir))

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://amanpreet-singh-003:5OSD41qlIZ563WoV@cluster0.5dr93uf.mongodb.net/quickDeskDB?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully")
    // Seed categories if none exist
    seedInitialData()
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

// Seed initial data
async function seedInitialData() {
  try {
    const Category = require("./models/Category")
    const User = require("./models/User")

    const categoryCount = await Category.countDocuments()
    if (categoryCount === 0) {
      console.log("No categories found, creating default categories...")

      // Find or create admin user
      let adminUser = await User.findOne({ role: "admin" })
      if (!adminUser) {
        const bcrypt = require("bcryptjs")
        const hashedPassword = await bcrypt.hash("admin123", 10)

        adminUser = new User({
          name: "System Admin",
          email: "admin@quickdesk.com",
          password: hashedPassword,
          role: "admin",
        })
        await adminUser.save()
        console.log("Created default admin user: admin@quickdesk.com / admin123")
      }

      const defaultCategories = [
        {
          name: "Technical Support",
          description: "Hardware and software technical issues",
          color: "#1976d2",
          icon: "computer",
          createdBy: adminUser._id,
        },
        {
          name: "Bug Report",
          description: "Report bugs and software issues",
          color: "#d32f2f",
          icon: "bug_report",
          createdBy: adminUser._id,
        },
        {
          name: "Feature Request",
          description: "Request new features or enhancements",
          color: "#388e3c",
          icon: "lightbulb",
          createdBy: adminUser._id,
        },
        {
          name: "Account Issues",
          description: "Login, password, and account related problems",
          color: "#f57c00",
          icon: "account_circle",
          createdBy: adminUser._id,
        },
        {
          name: "General Inquiry",
          description: "General questions and information requests",
          color: "#7b1fa2",
          icon: "help",
          createdBy: adminUser._id,
        },
      ]

      await Category.insertMany(defaultCategories)
      console.log(`Created ${defaultCategories.length} default categories`)
    }
  } catch (error) {
    console.error("Error seeding initial data:", error)
  }
}

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "QuickDesk API is running!",
    timestamp: new Date().toISOString(),
    uploadsDir: uploadsDir,
  })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err)

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 10MB." })
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Maximum is 5 files." })
    }
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: "Validation Error", errors })
  }

  // Mongoose cast errors
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" })
  }

  // Default error
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

module.exports = app
