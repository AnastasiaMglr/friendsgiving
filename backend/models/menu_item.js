const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comment: { type: String, required: false },
  friend: { type: String, required: true },
  category: { type: String, required: true },   // appetizer | entry | dinner | dessert
  subcategory: { type: String, required: false }, // optional (for Cocktails/Drinks)
  //addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("menu_item", menuItemSchema);