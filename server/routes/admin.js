const express = require("express");
const router = express.Router();
const db = require("../db");

// TEST
router.get("/test", (req, res) => {
  res.send("ADMIN ROUTE WORKING");
});

// GET ALL USERS
router.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

module.exports = router;
