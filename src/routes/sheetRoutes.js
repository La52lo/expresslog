const express = require("express");
const router = express.Router();
const { useDb } = require("../db/couch");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE
router.post("/", authMiddleware,async (req, res) => {
  try {
    const db = await useDb("sheets");
	if (req.body._id === "") {
		delete req.body._id;
	}
	const userId = req.user.id; // from decoded JWT

    const entry = {
      ...req.body,
      userId,
      createdAt: Date.now()
    };

    const result = await db.insert(entry);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const docs = await db.list({ include_docs: true });
    res.json(docs.rows.map(row => row.doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const db = await dbPromise;
    const doc = await db.get(req.params.id);
    res.json(doc);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const db = await dbPromise;
    const existing = await db.get(req.params.id);
    const updated = { ...existing, ...req.body };
    const result = await db.insert(updated);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const db = await dbPromise;
    const doc = await db.get(req.params.id);
    const result = await db.destroy(doc._id, doc._rev);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
