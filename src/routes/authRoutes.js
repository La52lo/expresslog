// src/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { useDb } = require("../db/couch");

const router = express.Router();
const USERS_DB = "users";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set in .env");
}

// Register
router.post("/register", async (req, res) => {
  try {
    const db = await useDb(USERS_DB);
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    // Check if user exists (search by username)
    const selector = { selector: { username } };
    const exist = await db.find(selector).catch(() => null);
    if (exist && exist.docs && exist.docs.length > 0) {
      return res.status(409).json({ error: "username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userDoc = {
      type: "user",
      username,
      email: email || null,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };

    const insert = await db.insert(userDoc);
    // respond without passwordHash
    const { id, ok, rev } = insert;
    res.status(201).json({ id, ok, rev });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const db = await useDb(USERS_DB);
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username and password required" });

    // Find user by username
    const finder = await db.find({ selector: { username }, limit: 1 });
    const user = (finder.docs && finder.docs[0]) || null;
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash || "");
    if (!match) return res.status(401).json({ error: "invalid credentials" });

    // Build token payload (keep it minimal)
    const payload = { sub: user._id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ token, expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
