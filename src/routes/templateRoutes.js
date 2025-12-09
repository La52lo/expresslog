const express = require("express");
const router = express.Router();
const { useDb } = require("../db/couch");
const authMiddleware = require("../middleware/authMiddleware");
const { buildDocId } = require("../utils");
const dayjs = require('dayjs');


const dbName = "templates";

// --------------------
// CREATE (POST) new entry
// --------------------
router.post("/", authMiddleware,async (req, res) => {
  try {
	const { title } = req.body;
	const body = req.body;
	console.log(body);
    const db = await useDb(dbName);
	const userId = req.user.id; // from decoded JWT
	const _id = buildDocId(userId, title);
	
	delete req.body.user;
	if (req.body._id === "") {
		delete req.body._id;
	}
	if (!title) {
      return res.status(400).json({ error: "Title required" });
    }
	try {
      await db.get(_id);
      return res.status(409).json({ error: "Document already exists" });
    } catch (err) {
      if (err.statusCode !== 404) throw err;
    }
	const now = dayjs();
    const template = {
      _id,
	  user: userId,
	  ...body
      
    };

    const result = await db.insert(template);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// --------------------
// READ all templates for user
// --------------------
router.get("/", authMiddleware, async (req, res) => {
  console.log("alltemplates");
  try {
    const db = await useDb(dbName);
    const userId = req.user.id;

    const result = await db.find({
      selector: { user: userId },
      sort: [{ _id: "asc" }]
    });

    const docs = result.docs.map(d => ({
      id: d._id,
      title: d.title,
      items: d.items
    }));

    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// READ all titles for user
// --------------------
router.get("/titles", authMiddleware, async (req, res) => {
  try {
    const db = await useDb(dbName);
    const userId = req.user.id;
    const result = await db.find({
      selector: { user: userId },
      fields: ["title"],
      sort: [{ title: "asc" }]
    });

    // Extract just titles into an array
    const titles = result.docs.map(doc => doc.title);

    res.json(titles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// --------------------
// READ one entry by title
// --------------------
router.get("/:title", authMiddleware, async (req, res) => {
	
  try {
    const db = await useDb(dbName);
    const userId = req.user.id;
    const title = req.params.title;
	
    const _id = buildDocId(userId, title);
	console.log("typeof _id:", typeof _id, "value:", _id);
    const doc = await db.get(_id);
	delete doc.user;
    res.json(doc);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});


// --------------------
// DELETE entry by title
// --------------------
router.delete("/:title", authMiddleware, async (req, res) => {
  try {
    const db = await useDb(dbName);
    const userId = req.user.id;
    const title = req.params.title;

    const _id = buildDocId(userId, title);
    const doc = await db.get(_id);
    const response = await db.destroy(doc._id, doc._rev);

    res.json({ ok: true, id: response.id, rev: response.rev });
  } catch (err) {
    console.error(err);
    if (err.statusCode === 404) return res.status(404).json({ error: "Not found" });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
