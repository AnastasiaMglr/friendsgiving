const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const menuRoutes = require("./routes/menuRoutes");

require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/menuItems", menuRoutes);

// Route test
app.get("/", (req, res) => {
  res.send("API menuItem Manager OK 🚀");
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB");
    app.listen(5000, () => console.log("🚀 Serveur lancé sur http://localhost:5000"));
  })
  .catch((err) => console.error(err));