require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/sheetRoutes"); // your existing
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

// public auth routes
app.use("/auth", authRoutes);

// protected API routes example
app.use("/api/sheets", authMiddleware, itemRoutes);

// alternative: allow list for read-only endpoints, etc.
// app.use("/api/items", itemRoutes); // if you want unauthenticated read

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
