const express = require("express")
const Category = require("../models/Category")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all categories
router.get("/", auth, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate("createdBy", "name email").sort({ name: 1 })

    res.json({ categories })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create category
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { name, description, color, icon } = req.body

    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" })
    }

    const category = new Category({
      name,
      description,
      color,
      icon,
      createdBy: req.user._id,
    })

    await category.save()
    await category.populate("createdBy", "name email")

    res.status(201).json({
      message: "Category created successfully",
      category,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update category
router.put("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { name, description, color, icon, isActive } = req.body

    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    if (name) category.name = name
    if (description !== undefined) category.description = description
    if (color) category.color = color
    if (icon) category.icon = icon
    if (isActive !== undefined) category.isActive = isActive

    await category.save()
    await category.populate("createdBy", "name email")

    res.json({
      message: "Category updated successfully",
      category,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete category
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    // Soft delete
    category.isActive = false
    await category.save()

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
