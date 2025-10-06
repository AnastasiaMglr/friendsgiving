const express = require("express");
const MenuItem = require("../models/menu_item");
const router = express.Router();

// CREATE (POST /menuItems)
router.post("/", async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all (GET /menuItems?category=dinner&subcategory=cocktail)
router.get("/", async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    const items = await MenuItem.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one (GET /menuItems/:id)
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: "menuItem not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (PUT /menuItems/:id)
router.put("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menuItem)
      return res.status(404).json({ message: "menuItem not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (DELETE /menuItems/:id)
router.delete("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: "menuItem not found" });
    res.json({ message: "menuItem deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

