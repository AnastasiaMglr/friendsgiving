const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
  name: { type: String, required: true },
  strength: { type: String, required: true },
  bonus: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("friend", friendSchema);