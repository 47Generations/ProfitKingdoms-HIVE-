const express = require("express");
const router = express.Router();

router.get("/:wallet", (req, res) => {
  res.json([]);
});

module.exports = router;
