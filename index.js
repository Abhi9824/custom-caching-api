const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/db");
const cacheRoutes = require("./routes/cacheRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
connectDB();

//Routes
app.use(cacheRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Hello Cactro");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
