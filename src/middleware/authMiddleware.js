// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { useDb } = require("../db/couch");
const JWT_SECRET = process.env.JWT_SECRET;

async function attachUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Optionally fetch full user doc from DB:
    const db = await useDb("users");
    const userDoc = await db.get(payload.sub).catch(() => null);
    if (!userDoc) return res.status(401).json({ error: "User not found" });

    // remove sensitive fields
    delete userDoc.passwordHash;
    req.user = userDoc;
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = attachUser;
