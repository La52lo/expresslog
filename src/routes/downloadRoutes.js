const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// --------------------
// Download Attachment Route
// --------------------
router.get("/:attachmentId/:filename", (req, res) => {
  const { attachmentId, filename } = req.params;
  const filePath = path.join(
    __dirname,
    "..","..",
    "uploads",
    attachmentId,
    filename
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.sendFile(filePath);
});

module.exports = router;