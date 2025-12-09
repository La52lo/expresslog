require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const sheetRoutes = require("./routes/sheetRoutes");
const templateRoutes = require("./routes/templateRoutes"); 
const downloadRoutes = require("./routes/downloadRoutes"); 
 // your existing
const fileUpload = require("express-fileupload");
const authMiddleware = require("./middleware/authMiddleware");

const path = require('path');




const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// public auth routes
app.use(fileUpload({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max limit example
  createParentPath: true
}));

app.use("/downloads", downloadRoutes);
app.use("/auth", authRoutes);

// protected API routes example
app.use("/sheets", authMiddleware, sheetRoutes);
app.use("/templates", authMiddleware, templateRoutes);



// alternative: allow list for read-only endpoints, etc.
// app.use("/api/items", itemRoutes); // if you want unauthenticated read

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

