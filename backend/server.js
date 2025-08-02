const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const multer = require("multer")

// Import routes
const authRoutes = require("./routes/auth")
const ticketRoutes = require("./routes/tickets")
const userRoutes = require("./routes/users")
const categoryRoutes = require("./routes/categories")
const notificationRoutes = require("./routes/notifications")

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Database connection
const MONGODB_URI =
  "mongodb+srv://amanpreet-singh-003:5OSD41qlIZ563WoV@cluster0.5dr93uf.mongodb.net/quickDeskDB?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "QuickDesk API is running!" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
