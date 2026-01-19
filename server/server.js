const express = require("express");
const cors = require("cors");
const path = require("path");

const { initDB } = require("./db");

const app = express();

/* ===== Middleware ===== */
app.use(cors({
  origin: "*", // dev only
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===== Basic test route ===== */
app.get("/", (req, res) => {
  res.send("Profit Kingdom API is running 🏰");
});

let db;

/* ===== Start server AFTER DB connects ===== */
initDB().then(conn => {
  db = conn;

  /* ---- LOGIN ---- */
  app.post("/login", async (req, res) => {
    const { wallet_id } = req.body;

    await db.execute(
      "INSERT IGNORE INTO players (wallet_id) VALUES (?)",
      [wallet_id]
    );

    res.json({ success: true });
  });

  /* ---- INVENTORY ---- */

  // Load inventory
  app.get("/inventory/:wallet", async (req, res) => {
    const [rows] = await db.execute(
      "SELECT item_id, quantity FROM inventory WHERE wallet_id = ?",
      [req.params.wallet]
    );
    res.json(rows);
  });

  // Save/update inventory
  app.post("/inventory/:wallet", async (req, res) => {
    const { wallet } = req.params;
    const items = req.body.items;

    for (const item of items) {
      await db.execute(
        `INSERT INTO inventory (wallet_id, item_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = ?`,
        [wallet, item.item_id, item.quantity, item.quantity]
      );
    }

    res.json({ success: true });
  });

  app.listen(3000, () =>
    console.log("Server running on port 3000 ⚔️")
  );
});
