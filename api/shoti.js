// api/shoti.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/shoti", async (req, res) => {
  try {
    const apiUrl = "https://haji-mix-api.gleeze.com/api/shoti?stream=false";

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Forward the same response to the frontend
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    console.error("Error fetching Shoti API:", err);
    res.status(500).json({ error: "Failed to fetch Shoti API" });
  }
});

export default router;
