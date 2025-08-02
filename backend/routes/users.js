const express = require("express")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all users (admin only)
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query

    const query = {}
    if (role) query.role = role
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get agents for assignment
router.get("/agents", auth, authorize("agent", "admin"), async (req, res) => {
  try {
    const agents = await User.find({
      role: { $in: ["agent", "admin"] },
      isActive: true,
    }).select("name email role")

    res.json({ agents })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update user role (admin only)
router.put("/:id/role", auth, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body

    if (!["user", "agent", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.role = role
    await user.save()

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Toggle user active status (admin only)
router.put("/:id/status", auth, authorize("admin"), async (req, res) => {
  try {
    const { isActive } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.isActive = isActive
    await user.save()

    res.json({
      message: "User status updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
