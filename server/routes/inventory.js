const express = require("express");
const router = express.Router();

router.get("/:wallet", (req, res) => {
  const wallet = req.params.wallet;

  const sql = `
    SELECT item_id, quantity
    FROM inventory
    WHERE wallet_id = ?
  `;

  db.query(sql, [wallet], (err, results) => {
    if (err) {
      console.error("Inventory load error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results); // ← THIS is important
  });
});

